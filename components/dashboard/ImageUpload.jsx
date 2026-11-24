"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/Button";
import { X, Loader2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/context/ImageUploadContext";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";

export function ImageUpload({ value, onChange, disabled }) {
    const { requestCrop, compressImage } = useImageUpload();
    const { restaurant } = useRestaurantStore();
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [aiUsed, setAiUsed] = useState(false);
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image (JPG, PNG, WebP)");
            return;
        }

        try {
            // 1. Crop (User interaction)
            // This opens the modal via context and waits for user to click "Done"
            const croppedBlob = await requestCrop(file);
            if (!croppedBlob) return; // User cancelled

            setIsLoading(true);
            const toastId = toast.loading("Optimizing image...");

            // 2. Compress
            const compressedFile = await compressImage(croppedBlob);

            // 3. Upload to Vercel Blob (Folder: restaurantId/filename)
            // Use restaurantId slug for folder, fallback to 'uploads' if missing
            const folder = restaurant?.restaurantId || 'uploads';
            // Clean filename
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `${folder}/${Date.now()}-${cleanName}`;

            const newBlob = await upload(filename, compressedFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });

            onChange(newBlob.url);
            setAiUsed(false); // Reset AI usage on new upload
            toast.success("Image uploaded", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setIsLoading(false);
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
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = async () => {
        if (value) {
            try {
                await fetch('/api/upload/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: value }),
                });
            } catch (e) {
                console.error("Failed to delete blob:", e);
                // Continue to clear UI even if delete fails
            }
        }
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
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (isLoading) return;
                                        setIsLoading(true);
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

                                            // 3. Upload processed image back to storage
                                            // Use same folder structure
                                            const folder = restaurant?.restaurantId || 'uploads';
                                            const filename = `${folder}/no-bg-${Date.now()}.png`;

                                            toast.loading("Uploading processed image...", { id: toastId });

                                            const uploadedBlob = await upload(filename, newBlob, {
                                                access: 'public',
                                                handleUploadUrl: '/api/upload',
                                            });

                                            onChange(uploadedBlob.url);
                                            setAiUsed(true); // Mark AI as used
                                            toast.success("Background Removed!", { id: toastId });

                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Failed to remove background", { id: toastId });
                                        } finally {
                                            setIsLoading(false);
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
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4" onClick={() => inputRef.current?.click()}>
                        {isLoading ? (
                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-3" />
                        ) : (
                            <UploadCloud className={cn("h-8 w-8 mb-3 transition-colors", dragActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                        <p className="mb-1 text-sm text-foreground font-medium">
                            <span className="font-semibold text-primary cursor-pointer hover:underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG or GIF (max. 5MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
