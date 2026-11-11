"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const modalRef = React.useRef(null);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close on ESC key
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent background scroll
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Focus trap could be added here for full a11y, simplified for now

    if (!isMounted) return null;
    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full m-4",
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className={cn(
                    "relative bg-background rounded-xl shadow-2xl w-full border border-border animate-scale-in flex flex-col max-h-[90vh]",
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold font-display tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t bg-muted/20 rounded-b-xl flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export { Modal };
