"use client";
import { useEffect, useRef } from "react";

// Keep keyboard and assistive-technology navigation inside an open modal.
export function useModalFocus(ref, open, onClose) {
    const close = useRef(onClose);
    close.current = onClose;
    useEffect(() => {
        const panel = ref.current;
        if (!open || !panel) return;
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        const siblings = [];
        for (let node = panel; node?.parentElement && node !== document.body; node = node.parentElement) {
            for (const sibling of node.parentElement.children) {
                if (sibling === node || ['SCRIPT', 'STYLE'].includes(sibling.tagName)) continue;
                siblings.push([sibling, sibling.inert]); sibling.inert = true;
            }
        }
        document.body.style.overflow = 'hidden';
        panel.focus({ preventScroll: true });
        const keydown = event => {
            if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
            if (event.key !== 'Tab') return;
            const controls = [...panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
                .filter(el => el.getClientRects().length && !el.closest('[inert]'));
            const first = controls[0], last = controls.at(-1);
            if (!first) { event.preventDefault(); panel.focus(); }
            else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        const focusin = event => { if (!panel.contains(event.target)) panel.focus(); };
        document.addEventListener('keydown', keydown); document.addEventListener('focusin', focusin);
        return () => {
            document.removeEventListener('keydown', keydown); document.removeEventListener('focusin', focusin);
            siblings.forEach(([el, wasInert]) => { el.inert = wasInert; });
            document.body.style.overflow = overflow;
            if (previous?.isConnected) previous.focus({ preventScroll: true });
        };
    }, [open, ref]);
}
