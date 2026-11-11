import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) {
          throw new Error('Unauthorized');
        }
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
