export function hashToken(token: string) {
  const hasher = new Bun.SHA256();
  hasher.update(token);
  return hasher.digest("hex");
}

export function calculateEpubHash(buffer: Buffer | Uint8Array): string {
  const hasher = new Bun.SHA256();
  hasher.update(buffer);
  return hasher.digest("hex");
}
