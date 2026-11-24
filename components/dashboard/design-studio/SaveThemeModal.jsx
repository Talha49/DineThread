"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const EMOJI_CHOICES = ['🎨', '✨', '🔥', '🌙', '🌊', '🍂', '🌸', '⚡', '🖤', '💎', '🌿', '🍯'];

export function SaveThemeModal({ isOpen, onClose, config, onSave, isSaving }) {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

    if (!config) return null;

    const swatches = [
        config.colors?.brand?.primary,
        config.colors?.brand?.secondary,
        config.colors?.brand?.tertiary,
    ].filter(Boolean);

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onSave({ name: trimmed, emoji });
    };

    const handleClose = () => {
        setName('');
        setEmoji(EMOJI_CHOICES[0]);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Save as My Theme"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || isSaving}>
                        {isSaving ? 'Saving...' : 'Save Theme'}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                <p className="text-sm text-zinc-500">
                    This saves your current colors, typography, visuals and layout as a reusable theme under <strong>My Themes</strong>.
                </p>

                {/* Live swatch preview */}
                <div className="flex gap-1.5 h-2 rounded-full overflow-hidden">
                    {swatches.map((color, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: color, opacity: 1 - i * 0.3 }} />
                    ))}
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500">Theme Name</label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        maxLength={40}
                        placeholder="e.g. Weekend Brunch Vibe"
                        className="w-full px-4 py-2.5 bg-zinc-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-zinc-900 transition-all outline-none"
                    />
                </div>

                {/* Emoji picker */}
                <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500">Icon</label>
                    <div className="flex flex-wrap gap-2">
                        {EMOJI_CHOICES.map((e) => (
                            <button
                                key={e}
                                type="button"
                                onClick={() => setEmoji(e)}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all",
                                    emoji === e ? "border-zinc-900 bg-zinc-50 scale-110" : "border-transparent bg-zinc-50/50 hover:bg-zinc-100"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
