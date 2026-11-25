import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request) {
  const { url } = await request.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const user = token ? await verifyJWT(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await del(url);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
