import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    status: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { message: "API URL is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();

    const apiResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(data, {
        status: apiResponse.status,
      });
    }

    const result = data as LoginResponse;

    const response = NextResponse.json({
      user: result.user,
    });

    const secure = process.env.NODE_ENV === "production";

    response.cookies.set("unified_access_token", result.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("unified_refresh_token", result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the authentication service" },
      { status: 502 },
    );
  }
}