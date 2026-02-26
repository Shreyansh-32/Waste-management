import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function getCookieName() {
  const url = process.env.NEXTAUTH_URL || "";
  const isSecure = url.startsWith("https://");
  return isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
}

export async function createSessionResponse(
  user: { id: string; name: string; email: string; role: string },
  status = 200,
) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }

  const token = await encode({
    token: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sub: user.id,
    },
    secret,
    maxAge: SESSION_MAX_AGE,
  });

  const response = NextResponse.json({ user }, { status });
  response.cookies.set(getCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getCookieName().startsWith("__Secure"),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
