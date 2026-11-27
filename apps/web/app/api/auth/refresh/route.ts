import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { message: "API URL is not configured" },
        { status: 500 },
      );
    }

    const refreshToken = request.cookies.get(
      "unified_refresh_token",
    )?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is missing" },
        { status: 401 },
      );
    }

    const apiResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      const response = NextResponse.json(data, {
        status: apiResponse.status,
      });

      response.cookies.delete("unified_access_token");
      response.cookies.delete("unified_refresh_token");

      return response;
    }

    const secure = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      message: "Session refreshed",
    });

    response.cookies.set("unified_access_token", data.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("unified_refresh_token", data.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to refresh session" },
      { status: 502 },
    );
  }
}