/** @jest-environment jsdom */
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

test('dialog has a name, contains focus, makes the background inert, and restores its trigger', async () => {
    const rect = jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 40, height: 20 }]);
    function Example() {
        const [open, setOpen] = useState(false);
        return <><button onClick={() => setOpen(true)}>Open options</button><Modal title="Soup options" isOpen={open} onClose={() => setOpen(false)}><button>Choose Large</button></Modal></>;
    }
    const { container } = render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Open options' }); trigger.focus(); fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Soup options' });
    await waitFor(() => expect(document.activeElement).toBe(dialog));
    expect(container.inert).toBe(true);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Choose Large' }));
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close modal' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger); expect(container.inert).not.toBe(true); rect.mockRestore();
});
