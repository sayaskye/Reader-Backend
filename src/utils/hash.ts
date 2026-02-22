export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const result = await Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  console.log(result);
  
  return result;
}

export async function calculateEpubHash(
  buffer: Buffer | Uint8Array,
): Promise<string> {
  const uint8 = new Uint8Array(buffer);
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    uint8.buffer as ArrayBuffer,
  );
  const result = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return result;
}
