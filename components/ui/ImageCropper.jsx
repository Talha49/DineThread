"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import { X, Check, Maximize } from "lucide-react";

export function ImageCropper({ isOpen, onClose, imageSrc, onCropComplete, onUseOriginal, aspect = 1 }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isSaving, setIsSaving] = useState(false); // Add local loading state

    const onCropChange = (crop) => setCrop(crop);
    const onZoomChange = (zoom) => setZoom(zoom);

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsSaving(true);
        await onCropComplete(croppedAreaPixels, imageSrc); // Wait for context actions
        // Do NOT call onClose() here, context's handleCropComplete does it.
        setIsSaving(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Image" maxWidth="max-w-xl">
            <div className="relative w-full h-80 bg-black rounded-md overflow-hidden mb-6">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                    showGrid={true}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-12">Zoom</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={onUseOriginal} title="Use original image without cropping">
                    <Maximize className="w-4 h-4 mr-2" />
                    Fit / Skip
                </Button>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Check className="w-4 h-4 mr-2" />}
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
