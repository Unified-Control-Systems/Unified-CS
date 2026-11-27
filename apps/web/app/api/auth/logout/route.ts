import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("unified_access_token");
  response.cookies.delete("unified_refresh_token");
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(
    "unified_refresh_token",
  )?.value;

  const response = NextResponse.json({
    message: "Logged out",
  });

  if (!refreshToken) {
    clearAuthCookies(response);
    return response;
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "API URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    // A previously revoked or expired session is already unusable.
    if (
      !backendResponse.ok &&
      backendResponse.status !== 401
    ) {
      return NextResponse.json(
        { message: "Backend could not confirm logout" },
        { status: 502 },
      );
    }

    clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to contact authentication service" },
      { status: 502 },
    );
  }
}