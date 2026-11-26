import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { ownsMenuImage, reserveMenuImage } from '@/lib/menu-images';

export async function POST(request) {
    const user = await verifyJWT(request.cookies.get('auth-token')?.value);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        if (body.type === 'reserve-image') {
            const pathname = await reserveMenuImage(user.id, body.contentType);
            if (!pathname) return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
            return NextResponse.json({ pathname }, { status: 201 });
        }
        const response = await handleUpload({
            request, body,
            onBeforeGenerateToken: async pathname => {
                if (!await ownsMenuImage(user.id, pathname)) throw new Error('Image unavailable');
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    maximumSizeInBytes: 5 * 1024 * 1024,
                    addRandomSuffix: false,
                    allowOverwrite: false
                };
            }
        });
        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: 'Could not authorize the upload' }, { status: 400 });
    }
}
