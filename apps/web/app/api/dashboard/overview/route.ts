
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens,
) {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set("unified_access_token", tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set("unified_refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "API URL is not configured" },
      { status: 500 },
    );
  }

  let accessToken = request.cookies.get(
    "unified_access_token",
  )?.value;

  const refreshToken = request.cookies.get(
    "unified_refresh_token",
  )?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    let apiResponse = accessToken
      ? await fetch(`${API_URL}/dashboard/overview`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        })
      : null;

    let refreshedTokens: AuthTokens | undefined;

    // Refresh and retry once if the access token has expired.
    if (apiResponse?.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (refreshResponse.ok) {
        const tokens: AuthTokens = await refreshResponse.json();

        refreshedTokens = tokens;
        accessToken = tokens.accessToken;

        apiResponse = await fetch(`${API_URL}/dashboard/overview`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });
      } else {
        // Refresh token is invalid, expired, or revoked.
        apiResponse = null;
      }
    }

    if (!apiResponse) {
      const response = NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );

      response.cookies.delete("unified_access_token");
      response.cookies.delete("unified_refresh_token");

      return response;
    }

    const data = await apiResponse.json();

    const response = NextResponse.json(data, {
      status: apiResponse.status,
    });

    // Persist rotated tokens after a successful refresh.
    if (refreshedTokens) {
      setAuthCookies(response, refreshedTokens);
    }

    // Clear cookies if authentication is no longer valid.
    if (apiResponse.status === 401) {
      response.cookies.delete("unified_access_token");
      response.cookies.delete("unified_refresh_token");
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to retrieve dashboard data" },
      { status: 502 },
    );
  }
}
