"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/Button";
import { X, Loader2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/context/ImageUploadContext";

export async function uploadImage(file) {
    const reservation = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reserve-image', contentType: file.type })
    });
    if (!reservation.ok) throw new Error('Could not reserve image');
    const { pathname } = await reservation.json();
    return upload(pathname, file, { access: 'public', handleUploadUrl: '/api/upload' });
}

export function ImageUpload({ value, onChange, disabled, onFileReady, onProcessingChange }) {
    const { requestCrop, compressImage } = useImageUpload();
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [aiUsed, setAiUsed] = useState(false);
    const inputRef = useRef(null);
    const processing = useRef(false);

    async function acceptPhoto(file) {
        if (onFileReady) {
            onFileReady(file);
        } else {
            const photo = await uploadImage(file);
            onChange(photo.url);
        }
    }

    const handleFile = async (file) => {
        if (!file || processing.current || disabled) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image (JPG, PNG, WebP)");
            return;
        }

        let toastId;
        processing.current = true;
        onProcessingChange?.(true);
        try {
            // 1. Crop (User interaction)
            // This opens the modal via context and waits for user to click "Done"
            const croppedBlob = await requestCrop(file);
            if (!croppedBlob) return; // User cancelled

            setIsLoading(true);
            toastId = toast.loading("Optimizing image...");

            // 2. Compress
            const compressedFile = await compressImage(croppedBlob);

            await acceptPhoto(compressedFile);
            setAiUsed(false); // Reset AI usage on new upload
            toast.success(onFileReady ? "Photo ready to save" : "Image uploaded", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setIsLoading(false);
            processing.current = false;
            onProcessingChange?.(false);
        }
    };

    const onDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (disabled || isLoading) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            e.target.value = "";
            handleFile(file);
        }
    };

    const handleRemove = () => {
        onChange("");
        setAiUsed(false);
    };

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200 bg-muted/5",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={disabled || isLoading}
                />

                {value ? (
                    <div className="relative h-full w-full p-2 group">
                        <div className="relative h-full w-full overflow-hidden rounded-md">
                            {/* Standard img tag for instant preview without Next.js optimization config issues */}
                            <img
                                src={value}
                                alt="Upload preview"
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    onClick={handleRemove}
                                    disabled={disabled || isLoading}
                                    variant="destructive"
                                    size="icon"
                                    className="h-9 w-9 shadow-sm"
                                    type="button"
                                    title="Remove Image"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Magic Remove BG Button */}
                        {!aiUsed && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                                <Button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (processing.current || disabled) return;
                                        processing.current = true;
                                        setIsLoading(true);
                                        onProcessingChange?.(true);
                                        const toastId = toast.loading("Removing background via AI...");

                                        try {
                                            // 1. Fetch current image as blob
                                            const response = await fetch(value);
                                            const blob = await response.blob();

                                            // 2. Send to Python API
                                            const formData = new FormData();
                                            formData.append('file', blob, 'image.png');

                                            const apiRes = await fetch('/api/remove-background', {
                                                method: 'POST',
                                                body: formData
                                            });

                                            if (!apiRes.ok) throw new Error("AI Processing Failed");

                                            const newBlob = await apiRes.blob();

                                            await acceptPhoto(newBlob);
                                            setAiUsed(true); // Mark AI as used
                                            toast.success("Background Removed!", { id: toastId });

                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Failed to remove background", { id: toastId });
                                        } finally {
                                            setIsLoading(false);
                                            processing.current = false;
                                            onProcessingChange?.(false);
                                        }
                                    }}
                                    disabled={disabled || isLoading}
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-xs bg-white/90 hover:bg-white text-black shadow-lg backdrop-blur-sm gap-2"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M7 3v4" /><path d="M11 3v4" /></svg>
                                    AI Remove BG
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button type="button" disabled={disabled || isLoading} aria-label="Upload image"
                        className="flex h-full w-full flex-col items-center justify-center rounded-lg px-4 py-5 text-center focus-visible:outline-2 focus-visible:outline-offset-2"
                        onClick={() => inputRef.current?.click()}>
                        {isLoading ? (
                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-3" />
                        ) : (
                            <UploadCloud className={cn("h-8 w-8 mb-3 transition-colors", dragActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                        <span className="mb-1 text-sm text-foreground font-medium">
                            <span className="font-semibold text-primary cursor-pointer hover:underline">Click to upload</span> or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground">
                            WebP, PNG, JPG or GIF (max. 5MB)
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
