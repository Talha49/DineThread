import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { removeMenuImage } from '@/lib/menu-images';

export async function POST(request) {
    const user = await verifyJWT(request.cookies.get('auth-token')?.value);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (typeof body?.url !== 'string') return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    try {
        const removed = await removeMenuImage(user.id, body.url);
        if (!removed) return NextResponse.json({ error: 'Image unavailable' }, { status: 404 });
        return NextResponse.json({ removed: true });
    } catch {
        return NextResponse.json({ error: 'Could not remove image' }, { status: 502 });
    }
}
