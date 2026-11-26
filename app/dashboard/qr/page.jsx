"use client";

import { useState, useEffect } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { QrCode, Download, Printer, ExternalLink, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ShareMenuButton } from "@/components/public/ShareMenuButton";

export default function QRPage() {
    const { restaurant } = useRestaurantStore();
    const [origin, setOrigin] = useState("");
    const [qr, setQr] = useState(null);
    useEffect(() => setOrigin(window.location.origin), []);
    const menuPath = restaurant?.restaurantId ? "/menu/" + encodeURIComponent(restaurant.restaurantId) : "";
    const publicMenuUrl = origin && menuPath ? origin + menuPath + "?src=qr" : "";
    const qrUrl = qr?.url === publicMenuUrl ? qr.image : "";
    const qrError = qr?.url === publicMenuUrl && qr.error;
    const isLocalhost = origin && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname);

    useEffect(() => {
        if (!publicMenuUrl) return;
        let current = true;
        QRCode.toDataURL(publicMenuUrl, {
            width: 600, margin: 4, color: { dark: "#18181b", light: "#ffffff" },
        }).then(image => {
            if (current) setQr({ url: publicMenuUrl, image });
        }).catch(() => {
            if (current) setQr({ url: publicMenuUrl, error: true });
        });
        return () => { current = false; };
    }, [publicMenuUrl]);

    const handleDownload = () => {
        if (!qrUrl) return;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `dinethread-${restaurant?.restaurantId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!restaurant) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-primary" />
                    QR Code
                </h1>
                <p className="text-muted-foreground text-lg">
                    Download and print your unique menu QR code for tables.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* QR Display */}
                <Card className="min-w-0 flex flex-col items-center justify-center p-4 sm:p-8">
                    <div className="w-full max-w-[300px] aspect-square bg-white p-2 rounded-2xl shadow-sm mb-6">
                        {qrError ? <p role="alert" className="p-4 text-zinc-900">Could not generate the QR code. Reload to retry.</p> : !qrUrl ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        ) : (
                            <img src={qrUrl} alt="Menu QR Code" className="w-full h-full" />
                        )}
                    </div>
                    <div className="w-full text-center space-y-1">
                        <p className="font-mono text-xs text-muted-foreground bg-muted py-1 px-3 rounded-full break-all">
                            {publicMenuUrl}
                        </p>
                        {isLocalhost && (
                            <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                                ⚠️ Localhost Warning: This QR code points to your computer.
                                It won't work on mobile unless you are on the same WiFi and use your local IP,
                                or until you deploy to Vercel.
                            </p>
                        )}
                    </div>
                </Card>

                {/* Actions */}
                <Card className="flex flex-col justify-center">
                    <CardHeader>
                        <CardTitle>Share Your Menu</CardTitle>
                        <CardDescription>
                            Get your menu in front of customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button disabled={!qrUrl} onClick={handleDownload} className="w-full justify-start" variant="outline" size="lg">
                            <Download className="w-5 h-5 mr-3" />
                            Download QR Image (PNG)
                        </Button>

                        <Button disabled={!qrUrl} onClick={() => window.print()} className="w-full justify-start" variant="outline" size="lg">
                            <Printer className="w-5 h-5 mr-3" />
                            Print QR Flyer
                        </Button>

                        <div className="grid gap-3 pt-4 border-t">
                            <ShareMenuButton menuPath={menuPath} title={restaurant.name} className="w-full rounded-md" />
                            <Link href={menuPath} target="_blank" rel="noopener" className="flex min-h-11 items-center justify-center gap-2 rounded-md border font-medium">
                                <ExternalLink aria-hidden="true" className="size-4" /> Open Menu Link
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {qrUrl && createPortal(
                <section id="menu-qr-flyer" className="hidden">
                    <h1>{restaurant.name}</h1>
                    <img src={qrUrl} alt="Menu QR code for printing" width="320" height="320" />
                    <p>Scan to view the menu</p>
                </section>, document.body
            )}
        </div>
    );
}
