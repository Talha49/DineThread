"use client";

import { useRef } from 'react';
import { usePreviewSender } from '@/hooks/use-theme-preview';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';

// Devices that don't accept a color prop (empty colors array)
const NO_COLOR_DEVICES = ['iPhone X', 'Galaxy Note 8', 'Nexus 5', 'HTC One', 'MacBook Pro'];
const NOTCH_DEVICES = ['iPhone X', 'Galaxy Note 8'];

export function LivePreview({
    restaurant,
    branding,
    device = 'iPhone X',
    minimal = false
}) {
    const iframeRef = useRef(null);
    const restaurantId = restaurant?.restaurantId;
    const previewUrl = restaurantId ? `/menu/${restaurantId}?preview=true` : null;
    const { brandColor, fontFamily, logoUrl, layoutID } = branding || {};

    const experienceConfig = restaurant?.experienceConfig || {};
    const connect = usePreviewSender(iframeRef, { brandColor, fontFamily, logoUrl,
        experienceConfig: { ...experienceConfig, layoutID: layoutID || experienceConfig.layoutID,
            themeConfig: branding?.themeConfig || experienceConfig.themeConfig } }, previewUrl);

    const hasNotch = NOTCH_DEVICES.includes(device);
    const topPad = hasNotch ? 44 : 24;

    const content = (
        <div className="w-full h-full bg-white overflow-hidden">
            <div style={{ height: topPad }} className="w-full shrink-0" />
            {!previewUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3 bg-zinc-50">
                    <div className="text-3xl animate-pulse">🍱</div>
                    <p className="text-sm font-medium text-zinc-500">Initializing preview...</p>
                </div>
            ) : (
                <iframe
                    ref={iframeRef}
                    onLoad={connect}
                    src={previewUrl}
                    className="w-full border-none"
                    style={{
                        height: `calc(100% - ${topPad}px)`,
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                    }}
                    title="Live Menu Preview"
                />
            )}
        </div>
    );

    if (minimal) return content;

    // Build props - only pass color for devices that support it
    const frameProps = { device };
    if (!NO_COLOR_DEVICES.includes(device)) {
        frameProps.color = 'black';
    }

    return (
        <DeviceFrameset {...frameProps}>
            {content}
        </DeviceFrameset>
    );
}
