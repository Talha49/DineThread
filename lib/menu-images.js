import { randomUUID } from 'node:crypto';
import { BlobNotFoundError, del, head } from '@vercel/blob';
import dbConnect from '@/lib/mongodb';
import MenuImage from '@/models/MenuImage';
import Restaurant from '@/models/Restaurant';

const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif']]);

export async function reserveMenuImage(owner, contentType) {
    const extension = extensions.get(contentType);
    if (!extension) return null;
    const pathname = `menu-images/${randomUUID()}.${extension}`;
    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner }).select('_id').lean();
    await MenuImage.create({ owner, pathname, restaurant: restaurant?._id });
    return pathname;
}

export async function ownsMenuImage(owner, pathname) {
    if (typeof pathname !== 'string') return false;
    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner }).select('_id').lean();
    const restaurantId = restaurant?._id ?? null;
    // Claim onboarding uploads for this owner's restaurant as soon as it exists.
    return Boolean(await MenuImage.findOneAndUpdate(
        { owner, pathname, restaurant: { $in: [restaurantId, null] } },
        { $set: { restaurant: restaurantId } },
        { projection: { _id: 1 } }
    ));
}

export async function removeMenuImage(owner, url) {
    if (typeof url !== 'string' || !URL.canParse(url)) return false;
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.public.blob.vercel-storage.com')) return false;
    const pathname = parsed.pathname.slice(1);
    if (!await ownsMenuImage(owner, pathname)) return false;

    try {
        const stored = await head(pathname);
        if (stored.url !== url) return false;
        await del(stored.url);
    } catch (error) {
        if (!(error instanceof BlobNotFoundError)) throw error;
    }
    await MenuImage.deleteOne({ owner, pathname });
    return true;
}
