import * as JSZip from "jszip";
import { parseStringPromise, processors } from "xml2js";

export type EpubMetadata = {
  title: string;
  author: string;
  language: string;
  publisher: string;
  description: string;
};

type TocItem = {
  title: string;
  href: string;
  children?: TocItem[];
};

export class EpubService {
  /**
   * Main method to extract all necessary data from an EPUB file buffer.
   */
  static async extractData(fileBuffer: Buffer): Promise<{
    metadata: EpubMetadata;
    version: string;
    toc: TocItem[] | null;
    coverBuffer: Buffer | null;
    mimeType: string | null;
  }> {
    const zip = await JSZip.loadAsync(fileBuffer);

    // 1. Find the OPF file path via container.xml
    const containerXml = await zip
      .file("META-INF/container.xml")
      ?.async("string");
    if (!containerXml) throw new Error("Invalid EPUB: Missing container.xml");

    // prevents the parser from failing when it encounters schemas or prefixes.
    const containerJson = await parseStringPromise(containerXml, {
      tagNameProcessors: [processors.stripPrefix],
    });
    const opfPath: string =
      containerJson.container.rootfiles[0].rootfile[0].$["full-path"];

    // 2. Parse the OPF file to get manifest and metadata
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) throw new Error("Invalid EPUB: Missing OPF file");

    const opfJson = await parseStringPromise(opfXml, {
      tagNameProcessors: [processors.stripPrefix],
      explicitArray: false,
    });

    const pkg = opfJson.package;
    const metadataNode = pkg.metadata;
    const version: string = pkg.$.version || "Unknown";

    // Normalize manifest to always be an array
    const manifest: any[] = Array.isArray(pkg.manifest.item)
      ? pkg.manifest.item
      : [pkg.manifest.item];

    // 3. Build the Metadata object
    const metadata: EpubMetadata = {
      title: metadataNode.title?._ || metadataNode.title || "Unknown title",
      author: this.normalizeAuthor(metadataNode.creator),
      language: metadataNode.language || "en",
      publisher: metadataNode.publisher || "",
      description: metadataNode.description || "",
    };

    // 4. Extract TOC with path normalization
    // @ts-ignore //this zip is already a JSZip, just a bug with jsmodules import, sigh.
    const toc = await this.extractToc(zip, opfPath, manifest, version);

    // 5. Handle Cover extraction
    const coverItem = this.findCoverItem(manifest);
    if (!coverItem) {
      return { metadata, version, toc, coverBuffer: null, mimeType: null };
    }

    const coverPath = this.resolveZipPath(opfPath, coverItem.$.href);
    const coverFile = zip.file(coverPath);

    if (!coverFile) {
      // Emergency fallback: Search by filename if the path resolution fails
      const filename = coverItem.$.href.split("/").pop();
      const fallbackFile = Object.values(zip.files).find((f) =>
        f.name.endsWith(filename),
      );

      if (!fallbackFile)
        return { metadata, version, toc, coverBuffer: null, mimeType: null };

      const coverBuffer = Buffer.from(await fallbackFile.async("arraybuffer"));
      return {
        metadata,
        version,
        toc,
        coverBuffer,
        mimeType: coverItem.$["media-type"],
      };
    }

    const coverBuffer = Buffer.from(await coverFile.async("arraybuffer"));
    return {
      metadata,
      version,
      toc,
      coverBuffer,
      mimeType: coverItem.$["media-type"] ?? null,
    };
  }

  /**
   * Normalizes the author field to prevent storing raw XML objects in the DB.
   */
  private static normalizeAuthor(creator: any): string {
    if (!creator) return "Unknown author";

    // Ensure we are working with an array
    const creators = Array.isArray(creator) ? creator : [creator];

    return creators
      .map((c) => {
        if (typeof c === "object") {
          // Extract the text value (_) from xml2js object format
          return c._ || c["$text"] || "Unknown";
        }
        return c; // It's already a string
      })
      .join(", ");
  }

  /**
   * Identifies the TOC file and parses it using JSZip instance type.
   * Note: zip parameter type is sketchy due to importation with ES modules.
   */
  private static async extractToc(
    zip: JSZip,
    opfPath: string,
    manifest: any[],
    version: string,
  ): Promise<TocItem[] | null> {
    let tocPath: string | undefined;
    let isNcx = false;

    if (version.startsWith("2")) {
      const ncxItem = manifest.find(
        (i) => i.$["media-type"] === "application/x-dtbncx+xml",
      );
      if (!ncxItem) return null;
      tocPath = this.resolveZipPath(opfPath, ncxItem.$.href);
      isNcx = true;
    } else if (version.startsWith("3")) {
      const navItem = manifest.find((i) => i.$?.properties?.includes("nav"));
      if (!navItem) {
        const ncxItem = manifest.find(
          (i) => i.$["media-type"] === "application/x-dtbncx+xml",
        );
        if (ncxItem) {
          tocPath = this.resolveZipPath(opfPath, ncxItem.$.href);
          isNcx = true;
        } else return null;
      } else {
        tocPath = this.resolveZipPath(opfPath, navItem.$.href);
      }
    } else return null;

    const tocXml = await zip.file(tocPath)?.async("string");
    if (!tocXml) return null;

    if (isNcx) {
      const ncxJson = await parseStringPromise(tocXml, {
        tagNameProcessors: [processors.stripPrefix],
        explicitArray: false,
      });
      return this.parseNcxNavPoints(
        ncxJson.ncx.navMap.navPoint,
        tocPath,
        opfPath,
      );
    } else {
      const navJson = await parseStringPromise(tocXml, {
        tagNameProcessors: [processors.stripPrefix],
        explicitArray: false,
      });
      const allNavs = this.findAllNodes(navJson.html.body, "nav");
      const tocNav =
        allNavs.find((n: any) => n.$?.["epub:type"] === "toc") ||
        allNavs.find((n: any) => n.ol);

      if (!tocNav || !tocNav.ol) return null;
      return this.parseNavOl(tocNav.ol, tocPath, opfPath);
    }
  }

  /**
   * TOC hrefs to be relative to the OPF file, resolves nested folder.
   */
  private static normalizeTocHref(
    tocPath: string,
    rawHref: string,
    opfPath: string,
  ): string {
    if (!rawHref || rawHref.startsWith("http") || rawHref.startsWith("#"))
      return rawHref;

    const absolutePath = this.resolveZipPath(tocPath, rawHref);
    const opfDirParts = opfPath.split("/").slice(0, -1);
    const opfDir = opfDirParts.join("/");

    if (opfDir && absolutePath.startsWith(opfDir + "/")) {
      return absolutePath.substring(opfDir.length + 1);
    }
    return absolutePath;
  }

  private static parseNcxNavPoints(
    navPoints: any,
    tocPath: string,
    opfPath: string,
  ): TocItem[] {
    if (!navPoints) return [];
    const points = Array.isArray(navPoints) ? navPoints : [navPoints];
    return points.map((point: any) => ({
      title: point.navLabel.text?._ || point.navLabel.text || "",
      href: this.normalizeTocHref(tocPath, point.content.$.src || "", opfPath),
      children: this.parseNcxNavPoints(point.navPoint, tocPath, opfPath),
    }));
  }

  private static parseNavOl(
    ol: any,
    tocPath: string,
    opfPath: string,
  ): TocItem[] {
    if (!ol) return [];
    const lis = Array.isArray(ol.li) ? ol.li : [ol.li];
    return lis.map((li: any) => {
      const link = li.a;
      const title =
        typeof link === "object"
          ? link._ || link["$text"] || "Unknown Title"
          : link || "";

      return {
        title: title.trim(),
        href: this.normalizeTocHref(tocPath, link?.$?.href || "", opfPath),
        children: li.ol ? this.parseNavOl(li.ol, tocPath, opfPath) : undefined,
      };
    });
  }

  private static findCoverItem(manifest: any[]): any | undefined {
    let item = manifest.find((i) => i.$?.properties?.includes("cover-image"));
    if (item) return item;

    item = manifest.find((i) => {
      const id = i.$?.id?.toLowerCase() ?? "";
      const href = i.$?.href?.toLowerCase() ?? "";
      const mime = i.$?.["media-type"]?.toLowerCase() ?? "";
      return (
        mime.startsWith("image/") &&
        (id.includes("cover") || href.includes("cover"))
      );
    });
    return (
      item || manifest.find((i) => i.$?.["media-type"]?.startsWith("image/"))
    );
  }

  private static findAllNodes(obj: any, targetTag: string): any[] {
    let results: any[] = [];
    if (!obj || typeof obj !== "object") return results;

    for (const key in obj) {
      if (key === targetTag) {
        const val = obj[key];
        if (Array.isArray(val)) results.push(...val);
        else results.push(val);
      } else {
        results.push(...this.findAllNodes(obj[key], targetTag));
      }
    }
    return results;
  }

  private static resolveZipPath(originPath: string, href: string): string {
    const basePath = originPath.split("/").slice(0, -1);
    const hrefParts = href.split("/");
    const finalPath = [...basePath];

    for (const part of hrefParts) {
      if (part === "..") finalPath.pop();
      else if (part !== "." && part !== "") finalPath.push(part);
    }
    return finalPath.join("/");
  }
}
