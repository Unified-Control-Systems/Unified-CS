import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: 'API URL is not configured' },
      { status: 500 },
    );
  }

  const accessToken = request.cookies.get(
    'unified_access_token',
  )?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: 'Unable to retrieve notifications' },
      { status: 502 },
    );
  }
}