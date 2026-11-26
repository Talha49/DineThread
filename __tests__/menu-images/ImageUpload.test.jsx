import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUpload } from '@/components/dashboard/ImageUpload';

jest.mock('@vercel/blob/client', () => ({ upload: jest.fn() }));
jest.mock('@/context/ImageUploadContext', () => ({
    useImageUpload: () => ({})
}));

test('removing a saved photo changes the draft without calling storage', () => {
    const original = 'https://photos.example.org/soup.png';
    function Editor() {
        const [photo, setPhoto] = useState(original);
        return <>
            <ImageUpload value={photo} onChange={setPhoto} />
            <button onClick={() => setPhoto(original)}>Cancel edit</button>
        </>;
    }

    const previousFetch = global.fetch;
    global.fetch = jest.fn();
    try {
        const { container } = render(<Editor />);
        fireEvent.click(screen.getByTitle('Remove Image'));
        const picker = screen.getByRole('button', { name: 'Upload image' });
        expect(picker.tabIndex).toBe(0);
        const openFileChooser = jest.spyOn(container.querySelector('input[type="file"]'), 'click');
        fireEvent.click(picker);
        expect(openFileChooser).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));
        expect(screen.getByAltText('Upload preview')).toHaveAttribute('src', original);
        expect(global.fetch).not.toHaveBeenCalled();
    } finally {
        global.fetch = previousFetch;
    }
});
