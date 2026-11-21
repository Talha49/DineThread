"use client";

import { useRef, useEffect } from 'react';
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

    useEffect(() => {
        const sendUpdate = () => {
            if (iframeRef.current?.contentWindow) {
                const experienceConfig = restaurant?.experienceConfig || {};
                iframeRef.current.contentWindow.postMessage({
                    type: "PREVIEW_UPDATE",
                    data: {
                        brandColor,
                        fontFamily,
                        logoUrl,
                        experienceConfig: {
                            ...experienceConfig,
                            layoutID: layoutID || experienceConfig.layoutID,
                            themeConfig: branding?.themeConfig || experienceConfig.themeConfig
                        }
                    }
                }, "*");
            }
        };
        sendUpdate();
        const timer = setTimeout(sendUpdate, 1000);
        return () => clearTimeout(timer);
    }, [
        brandColor, 
        fontFamily, 
        logoUrl, 
        layoutID, 
        previewUrl, 
        restaurant?.experienceConfig?.vibeTokens, 
        restaurant?.experienceConfig?.themeConfig,
        restaurant?.experienceConfig?.designSystem?.config
    ]);

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
