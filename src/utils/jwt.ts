import { SignJWT } from "jose";

export const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createJWT(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}
