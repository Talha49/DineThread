"use client";

import { useState, useEffect, useRef } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { QrCode, Download, Printer, ExternalLink, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";

export default function QRPage() {
    const { restaurant } = useRestaurantStore();
    const [qrUrl, setQrUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    const [isLocalhost, setIsLocalhost] = useState(false);

    useEffect(() => {
        if (window.location.hostname === "localhost") {
            setIsLocalhost(true);
        }
    }, []);

    // ?src=qr lets the public menu page tell a QR scan apart from a direct
    // visit/share link - see app/api/analytics/track.
    const publicMenuUrl = restaurant?.restaurantId
        ? `${window.location.protocol}//${window.location.host}/menu/${restaurant.restaurantId}?src=qr`
        : "";

    useEffect(() => {
        if (publicMenuUrl) {
            generateQR();
        }
    }, [publicMenuUrl, restaurant]);

    const generateQR = async () => {
        try {
            setLoading(true);
            const url = await QRCode.toDataURL(publicMenuUrl, {
                width: 400,
                margin: 2,
                color: {
                    dark: restaurant?.brandColor || "#000000",
                    light: "#ffffff",
                },
            });
            setQrUrl(url);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (format) => {
        if (!qrUrl) return;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `smart-menu-${restaurant?.restaurantId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Menu QR Code</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                        img { max-width: 300px; }
                        h1 { margin-bottom: 10px; }
                        p { margin-top: 0; color: #555; }
                    </style>
                </head>
                <body>
                    <h1>${restaurant?.name || "Scan for Menu"}</h1>
                    <img src="${qrUrl}" />
                    <p>Scan to view menu</p>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
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
                <Card className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-dashed border-primary/20 mb-6">
                        {loading ? (
                            <div className="w-[300px] h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        ) : (
                            <img src={qrUrl} alt="Menu QR Code" className="w-[300px] h-[300px]" />
                        )}
                    </div>
                    <div className="text-center space-y-1">
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
                        <Button onClick={() => handleDownload("png")} className="w-full justify-start" variant="outline" size="lg">
                            <Download className="w-5 h-5 mr-3" />
                            Download QR Image (PNG)
                        </Button>

                        <Button onClick={handlePrint} className="w-full justify-start" variant="outline" size="lg">
                            <Printer className="w-5 h-5 mr-3" />
                            Print QR Flyer
                        </Button>

                        <div className="pt-4 mt-4 border-t">
                            <Link href={`/menu/${restaurant.restaurantId}`} target="_blank">
                                <Button className="w-full" size="lg">
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Open Menu Link
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
