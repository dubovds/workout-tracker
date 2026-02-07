import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Workout Tracker", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  const username = process.env.SITE_USERNAME ?? "admin";
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = authHeader.slice(6);
  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedResponse();
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return unauthorizedResponse();
  }

  const providedUsername = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  if (providedUsername !== username || providedPassword !== password) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
