import { jwtVerify, SignJWT } from "jose";

const accessSecret = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function createJWT(userId: string, roles: string[] = ["User"]) {
  return new SignJWT({ roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(accessSecret);
}

export async function createRefreshToken(userId: string) {
  const jti = Bun.randomUUIDv7();
  
  const token = await new SignJWT({ type: "refresh" })
  .setProtectedHeader({ alg: "HS256" })
  .setSubject(userId)
  .setJti(jti)
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(refreshSecret);

  return { refreshToken: token, jti };
}

export async function verify(token: string) {
  try {
    return await jwtVerify(token, accessSecret);
  } catch {
    return await jwtVerify(token, refreshSecret);
  }
}
