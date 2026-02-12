export function hashToken(token: string) {
  const hasher = new Bun.SHA256();
  hasher.update(token);
  return hasher.digest("hex");
}