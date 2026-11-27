import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
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

  const { id } = await context.params;

  try {
    const response = await fetch(
      `${API_URL}/notifications/${encodeURIComponent(id)}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: 'Unable to update notification' },
      { status: 502 },
    );
  }
}