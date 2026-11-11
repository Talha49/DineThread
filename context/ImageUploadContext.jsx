"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ImageCropper } from "@/components/ui/ImageCropper";
import imageCompression from "browser-image-compression";

const ImageUploadContext = createContext(null);

// HELPER FUNCTIONS (Outside Component)
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 1); // high quality intermediate
    });
};

export function ImageUploadProvider({ children }) {
    const [cropperState, setCropperState] = useState({
        isOpen: false,
        imageSrc: null,
        resolve: null, // Promise resolve function
        aspect: 1,
        imageFile: null // Store original
    });

    const closeCropper = () => {
        setCropperState(prev => ({ ...prev, isOpen: false }));
        if (cropperState.resolve) cropperState.resolve(null); // Resolve with null if cancelled
    };

    const requestCrop = useCallback((imageFile, aspect = 1) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                setCropperState({
                    isOpen: true,
                    imageSrc: reader.result,
                    imageFile, // Store original file
                    resolve,
                    aspect
                });
            };
        });
    }, []);

    const handleCropComplete = async (croppedAreaPixels, imageSrc) => {
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (cropperState.resolve) cropperState.resolve(croppedBlob);
        } catch (e) {
            console.error(e);
            if (cropperState.resolve) cropperState.resolve(null);
        } finally {
            // Close after resolving
            setCropperState(prev => ({ ...prev, isOpen: false, resolve: null }));
        }
    };

    const handleUseOriginal = () => {
        if (cropperState.resolve && cropperState.imageFile) {
            cropperState.resolve(cropperState.imageFile);
        }
        setCropperState(prev => ({ ...prev, isOpen: false, resolve: null }));
    };

    const compressImage = async (imageFile) => {
        const options = {
            maxSizeMB: 0.1, // ~100kb
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: "image/webp"
        };
        try {
            return await imageCompression(imageFile, options);
        } catch (error) {
            console.error("Compression failed:", error);
            return imageFile; // fallback to original
        }
    };

    return (
        <ImageUploadContext.Provider value={{ requestCrop, compressImage }}>
            {children}
            {cropperState.isOpen && (
                <ImageCropper
                    isOpen={cropperState.isOpen}
                    onClose={closeCropper}
                    imageSrc={cropperState.imageSrc}
                    onCropComplete={handleCropComplete}
                    onUseOriginal={handleUseOriginal}
                    aspect={cropperState.aspect}
                />
            )}
        </ImageUploadContext.Provider>
    );
}

export const useImageUpload = () => {
    const context = useContext(ImageUploadContext);
    if (!context) throw new Error("useImageUpload must be used within ImageUploadProvider");
    return context;
};
