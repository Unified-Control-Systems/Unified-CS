import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(
    "unified_refresh_token",
  )?.value;

  if (refreshToken && API_URL) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Local cookies are cleared even if the API is unavailable.
    }
  }

  const response = NextResponse.json({
    message: "Logged out",
  });

  response.cookies.delete("unified_access_token");
  response.cookies.delete("unified_refresh_token");

  return response;
}