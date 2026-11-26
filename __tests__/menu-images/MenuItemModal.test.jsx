import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { upload } from '@vercel/blob/client';
import { MenuItemModal } from '@/components/dashboard/MenuItemModal';
import { useImageUpload } from '@/context/ImageUploadContext';

jest.mock('@vercel/blob/client', () => ({ upload: jest.fn() }));
jest.mock('@/context/ImageUploadContext', () => ({ useImageUpload: jest.fn() }));
jest.mock('@/hooks/use-category-store', () => ({
    useCategoryStore: () => ({ categories: [{ _id: 'lunch', name: 'Lunch' }] })
}));
jest.mock('react-hot-toast', () => ({
    __esModule: true, default: { loading: jest.fn(), success: jest.fn(), error: jest.fn() }
}));

const original = '/menu-photos/tomato-soup.webp';
const replacement = 'https://photos.example.org/replacement.webp';
const dish = { _id: 'soup', name: 'Soup', price: 8, category: 'Lunch', imageUrl: original };
const file = new File(['test photo'], 'new.webp', { type: 'image/webp' });
const originalFetch = global.fetch;
const createUrl = URL.createObjectURL;
const revokeUrl = URL.revokeObjectURL;

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { resolve, promise };
}

function edit() {
    const onClose = jest.fn();
    const view = render(<MenuItemModal isOpen initialData={dish} onClose={onClose} onRefresh={() => {}} />);
    fireEvent.click(screen.getByTitle('Remove Image'));
    fireEvent.change(document.querySelector('input[type=file]'), { target: { files: [file] } });
    return { ...view, onClose };
}

const save = () => screen.getByRole('button', { name: 'Save Changes' });
const preview = () => screen.findByAltText('Upload preview');
const json = (status, body) => ({ status, ok: status < 300, json: async () => body });

beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(() => 'blob:local-draft');
    URL.revokeObjectURL = jest.fn();
    useImageUpload.mockReturnValue({ requestCrop: async f => f, compressImage: async f => f });
    upload.mockResolvedValue({ url: replacement });
    global.fetch = jest.fn(async path => {
        if (path === '/api/upload') return json(201, { pathname: 'menu-images/new.webp' });
        if (path === '/api/menu/soup' || path === '/api/upload/delete') return json(200, {});
        throw new Error('Unexpected request to ' + path);
    });
});

afterEach(() => {
    global.fetch = originalFetch;
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = revokeUrl;
});

test('discarding a prepared replacement releases its preview without reserving or uploading a photo', async () => {
    const { onClose, unmount } = edit();
    expect(await preview()).toHaveAttribute('src', 'blob:local-draft');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-draft');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
});

test('a slow photo blocks premature submissions and dismissal during the single save', async () => {
    const prepared = deferred();
    const transferred = deferred();
    useImageUpload.mockReturnValue({ requestCrop: async f => f, compressImage: () => prepared.promise });
    upload.mockReturnValue(transferred.promise);
    const { onClose, unmount } = edit();
    expect(screen.getByRole('button', { name: /Preparing photo/ })).toBeDisabled();
    fireEvent.submit(document.querySelector('form'));
    expect(global.fetch).not.toHaveBeenCalled();
    await act(async () => prepared.resolve(file));
    fireEvent.click(save());
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(save()).toBeDisabled();
    fireEvent.submit(document.querySelector('form'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(global.fetch.mock.calls.map(([path]) => path)).toEqual(['/api/upload']);
    await act(async () => transferred.resolve({ url: replacement }));
    expect(onClose).toHaveBeenCalledTimes(1);
    const [path, request] = global.fetch.mock.calls[1];
    expect(path).toBe('/api/menu/soup');
    expect(JSON.parse(request.body)).toMatchObject({ imageUrl: replacement, previousImageUrl: original });
    unmount();
});

test('a rejected edit discards only the uploaded replacement and keeps its local file for retry', async () => {
    const { onClose, unmount } = edit();
    await preview();
    global.fetch.mockResolvedValueOnce(json(201, { pathname: 'menu-images/new.webp' }))
        .mockResolvedValueOnce(json(409, { message: 'Photo has changed' }));
    fireEvent.click(save());
    await waitFor(() => expect(save()).toBeEnabled());
    const [path, request] = global.fetch.mock.calls[2];
    expect(path).toBe('/api/upload/delete');
    expect(JSON.parse(request.body)).toEqual({ url: replacement });
    expect(onClose).not.toHaveBeenCalled();
    expect(await preview()).toHaveAttribute('src', 'blob:local-draft');
    fireEvent.click(save());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    unmount();
});

test('a failed upload leaves the dish alone and the replacement available for a second save', async () => {
    upload.mockRejectedValueOnce(new Error('Upload interrupted'));
    const { onClose, unmount } = edit();
    await preview();
    fireEvent.click(save());
    await waitFor(() => expect(save()).toBeEnabled());
    expect(global.fetch.mock.calls.map(([path]) => path)).toEqual(['/api/upload']);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(save());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledTimes(2);
    expect(JSON.parse(global.fetch.mock.calls.at(-1)[1].body).imageUrl).toBe(replacement);
    unmount();
});
