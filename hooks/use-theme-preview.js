"use client";

import { useEffect, useRef, useState } from 'react';
import { createPreviewController, ThemePreviewSchema } from '@/lib/theme-preview';
import { useRestaurantStore } from '@/hooks/use-restaurant-store';

export function themeResearchEnabled() {
  return process.env.NEXT_PUBLIC_THEME_RESEARCH === '1' && typeof window !== 'undefined'
    && ['127.0.0.1', 'localhost'].includes(window.location.hostname);
}

export function usePreviewSender(iframeRef, data, url) {
  const controller = useRef(null);
  const latest = useRef(data);
  latest.current = data;
  const connect = () => controller.current?.connect(crypto.randomUUID());
  useEffect(() => {
    if (!url) return;
    const research = themeResearchEnabled();
    const events = [];
    const instance = createPreviewController({
      target: () => iframeRef.current?.contentWindow, origin: window.location.origin,
      requestFrame: cb => requestAnimationFrame(cb), cancelFrame: id => cancelAnimationFrame(id),
      strategy: research && sessionStorage.getItem('theme-strategy') === 'immediate' ? 'immediate' : 'coalesced',
      onEvent: event => { if (research) events.push({ ...event, at: performance.now(), visibility: document.visibilityState }); },
    });
    controller.current = instance;
    if (research) window.__themePreview = { controller: instance, events };
    const listener = event => instance.receive(event);
    window.addEventListener('message', listener);
    instance.connect(crypto.randomUUID());
    instance.update(latest.current);
    // A store subscription observes every editor event, even if React batches
    // multiple renders. Prop-driven legacy branding uses the effect below.
    const unsubscribe = useRestaurantStore.subscribe((state, previous) => {
      if (state.previewData !== previous.previewData && state.previewData) instance.update(state.previewData);
    });
    const hello = setInterval(() => instance.hello(), 200);
    return () => { clearInterval(hello); unsubscribe(); instance.dispose(); window.removeEventListener('message', listener); controller.current = null; if (research) delete window.__themePreview; };
  }, [url, iframeRef]);
  useEffect(() => { controller.current?.update(data); }, [data]);
  return connect;
}

export function usePreviewReceiver(enabled) {
  const [applied, setApplied] = useState(null);
  const connection = useRef(null), revision = useRef(0), session = useRef(null);
  useEffect(() => {
    if (!enabled || window.parent === window) return;
    session.current = crypto.randomUUID();
    const listener = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const msg = event.data;
      if (msg?.type === 'THEME_HELLO' && typeof msg.connection === 'string') {
        if (connection.current !== msg.connection) { connection.current = msg.connection; revision.current = 0; }
        window.parent.postMessage({ type: 'THEME_READY', connection: connection.current, session: session.current }, window.location.origin);
      } else if (msg?.type === 'THEME_UPDATE' && msg.connection === connection.current && msg.session === session.current
          && Number.isSafeInteger(msg.revision) && msg.revision > revision.current) {
        const result = ThemePreviewSchema.safeParse(msg.data);
        if (!result.success) return;
        revision.current = msg.revision;
        setApplied({ data: result.data, revision: msg.revision, connection: msg.connection });
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [enabled]);
  useEffect(() => {
    if (!applied) return;
    const frame = requestAnimationFrame(() => {
      if (applied.revision !== revision.current || applied.connection !== connection.current) return;
      const root = document.querySelector('.theme-root');
      if (!root) return;
      const css = getComputedStyle(root);
      const config = applied.data.experienceConfig.designSystem?.config || applied.data.experienceConfig.themeConfig;
      const styles = { primary: css.getPropertyValue('--color-primary').trim(), base: css.getPropertyValue('--text-base').trim(), padding: css.getPropertyValue('--item-card-padding').trim(), layout: root.dataset.layout };
      const matches = !config || (styles.primary === config.colors?.brand?.primary && styles.base === `${config.typography?.sizes?.base || 16}px`
        && styles.padding === `${config.menuItem?.card?.padding ?? 16}px` && styles.layout === (applied.data.experienceConfig.layoutID || 'grid'));
      window.parent.postMessage({ type: 'THEME_ACK', connection: applied.connection, session: session.current, revision: applied.revision, styles, matches,
        visibility: document.visibilityState }, window.location.origin);
    });
    return () => cancelAnimationFrame(frame);
  }, [applied]);
  return applied?.data || null;
}
