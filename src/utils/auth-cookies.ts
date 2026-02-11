import { Context } from "hono";
import { setCookie } from "hono/cookie";

export enum tokenTypes {
  access = "access_token",
  refresh = "refresh_token",
}
export const setAuthCookie = (
  c: Context,
  type: tokenTypes,
  token: string,
  maxAge: number,
) => {
  setCookie(c, type, token, {
    httpOnly: true,
    maxAge,
    sameSite: "strict",
    secure: true,
    path: "/",
  });
};

export const clearAuthCookie = (
  c: Context,
  type: tokenTypes,
) => {
  setCookie(c, type, "", {
    httpOnly: true,
    maxAge: 0,
    sameSite: "strict",
    secure: true,
    path: "/",
  });
};
