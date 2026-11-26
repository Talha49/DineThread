/** @jest-environment node */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { del, head } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { verifyJWT } from '@/lib/jwt';
import Restaurant from '@/models/Restaurant';
import MenuImage from '@/models/MenuImage';
import MenuItem from '@/models/MenuItem';
import { POST as authorizeUpload } from '@/app/api/upload/route';
import { POST as deleteUpload } from '@/app/api/upload/delete/route';
import { DELETE as deleteDish } from '@/app/api/menu/[id]/route';

jest.mock('@vercel/blob', () => ({
    head: jest.fn(), del: jest.fn(), BlobNotFoundError: class extends Error {}
}));
jest.mock('@vercel/blob/client', () => ({ handleUpload: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/jwt', () => ({ verifyJWT: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'test-session' }) }) }));

const first = new mongoose.Types.ObjectId();
const second = new mongoose.Types.ObjectId();
const blobUrl = pathname => 'https://test.public.blob.vercel-storage.com/' + pathname;
const request = body => ({ cookies: { get: () => ({ value: 'test-session' }) }, json: async () => body });
const signIn = id => verifyJWT.mockResolvedValue({ id: String(id) });
let mongo, secondRestaurant;

async function reserve() {
    const response = await authorizeUpload(request({ type: 'reserve-image', contentType: 'image/png' }));
    expect(response.status).toBe(201);
    return (await response.json()).pathname;
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
    await mongoose.connect(mongo.getUri('image_ownership'));
    secondRestaurant = await Restaurant.create({ owner: second, name: 'Second cafe', restaurantId: 'second' });
});
beforeEach(() => {
    jest.clearAllMocks();
    signIn(first);
    head.mockImplementation(async pathname => ({ url: blobUrl(pathname) }));
    del.mockResolvedValue(undefined);
    handleUpload.mockImplementation(async ({ body, onBeforeGenerateToken }) => onBeforeGenerateToken(body.pathname));
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });

test('onboarding reservation follows its owner when the restaurant opens', async () => {
    const pathname = await reserve();
    expect((await MenuImage.findOne({ pathname })).restaurant).toBeNull();
    const restaurant = await Restaurant.create({ owner: first, name: 'First cafe', restaurantId: 'first' });
    const token = await authorizeUpload(request({ type: 'blob.generate-client-token', pathname }));
    expect(await token.json()).toMatchObject({ allowOverwrite: false, addRandomSuffix: false });
    expect((await MenuImage.findOne({ pathname })).restaurant).toEqual(restaurant._id);
    const url = blobUrl(pathname);
    expect((await deleteUpload(request({ url }))).status).toBe(200);
    expect(del).toHaveBeenCalledWith(url);
    expect(await MenuImage.exists({ pathname })).toBeNull();
});

test('a second restaurant cannot authorize or delete the first restaurant’s image', async () => {
    const pathname = await reserve();
    const url = blobUrl(pathname);
    signIn(second);
    expect((await authorizeUpload(request({ type: 'blob.generate-client-token', pathname }))).status).toBe(400);
    expect((await deleteUpload(request({ url }))).status).toBe(404);
    const dish = await MenuItem.create({ restaurant: secondRestaurant._id, name: 'Soup', price: 8, category: 'Lunch', imageUrl: url });
    expect((await deleteDish({}, { params: { id: String(dish._id) } })).status).toBe(200);
    expect(head).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(await MenuImage.exists({ pathname, owner: first })).toBeTruthy();
});

test('deleting an owned dish removes its verified blob', async () => {
    signIn(second);
    const pathname = await reserve();
    const url = blobUrl(pathname);
    const dish = await MenuItem.create({ restaurant: secondRestaurant._id, name: 'Tart', price: 4, category: 'Dessert', imageUrl: url });
    expect((await deleteDish({}, { params: { id: String(dish._id) } })).status).toBe(200);
    expect(del).toHaveBeenCalledWith(url);
});

test('legacy and mismatched URLs are never passed to storage for deletion', async () => {
    expect((await deleteUpload(request({ url: blobUrl('older/soup.png') }))).status).toBe(404);
    const pathname = await reserve();
    const foreignStore = 'https://other.public.blob.vercel-storage.com/' + pathname;
    expect((await deleteUpload(request({ url: foreignStore }))).status).toBe(404);
    expect(del).not.toHaveBeenCalled();
});

test('a storage failure preserves the record so its owner can retry', async () => {
    const pathname = await reserve();
    const url = blobUrl(pathname);
    del.mockRejectedValueOnce(new Error('Storage unavailable'));
    expect((await deleteUpload(request({ url }))).status).toBe(502);
    expect(await MenuImage.exists({ pathname })).toBeTruthy();
    expect((await deleteUpload(request({ url }))).status).toBe(200);
});

test('anonymous requests cannot reserve or remove images', async () => {
    verifyJWT.mockResolvedValue(null);
    expect((await authorizeUpload(request({ type: 'reserve-image', contentType: 'image/png' }))).status).toBe(401);
    expect((await deleteUpload(request({ url: blobUrl('older/soup.png') }))).status).toBe(401);
    expect(del).not.toHaveBeenCalled();
});
