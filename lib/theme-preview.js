import { z } from 'zod';

const colour = z.string().max(100).regex(/^(#[0-9a-f]{3,8}|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\)|transparent)$/i);
const font = z.object({ family: z.string().min(1).max(100).regex(/^[\w\s,'"-]+$/), weight: z.number().min(100).max(900).optional() }).passthrough();
const length = z.string().regex(/^\d+(\.\d+)?(px|rem|em|%)$/);
export const LayoutSchema = z.enum(['grid','classic-grid','list','bento-magazine','signature-showcase','orbital-wheel','liquid-carousel','masonry','subway-map','menu-deck','voronoi-mosaic']);

// Existing presets contain additional design fields. Preserve them, but bound the
// JSON tree and validate the editable values used by the preview comparison.
export const ThemeConfigSchema = z.object({
  layoutID: LayoutSchema.optional(),
  colors: z.record(z.string(), z.record(z.string(), colour)).optional(),
  typography: z.object({
    fonts: z.object({ heading: font.optional(), body: font.optional(), accent: font.optional() }).passthrough().optional(),
    sizes: z.object({ base: z.number().min(10).max(40).optional(), scale: z.number().min(0.5).max(3).optional() }).catchall(z.number().min(1).max(128)).optional(),
    lineHeights: z.record(z.string(), z.number().min(0.5).max(4)).optional(),
  }).passthrough().optional(),
  visual: z.object({ radius: length.optional(), glass: z.number().min(0).max(100).optional() }).passthrough().optional(),
  menuItem: z.object({ card: z.object({ padding: z.number().min(0).max(128).optional() }).passthrough().optional() }).passthrough().optional(),
  background: z.object({ type: z.enum(['solid','gradient','pattern','image']), color: colour.optional() }).passthrough().optional(),
}).passthrough().superRefine((value, ctx) => {
  let count = 0;
  const visit = (node, depth) => {
    if (++count > 2000 || depth > 16) return false;
    if (node === null || typeof node === 'boolean') return true;
    if (typeof node === 'string') return node.length <= 4096;
    if (typeof node === 'number') return Number.isFinite(node);
    if (Array.isArray(node)) return node.length <= 100 && node.every(v => visit(v, depth + 1));
    if (node && typeof node === 'object') return Object.entries(node).every(([key, v]) => !['__proto__','constructor','prototype'].includes(key) && visit(v, depth + 1));
    return false;
  };
  if (!visit(value, 0)) ctx.addIssue({ code: 'custom', message: 'Invalid or oversized theme configuration' });
});

export const ThemePreviewSchema = z.object({
  brandColor: colour.optional().nullable(), fontFamily: z.string().max(100).optional().nullable(), logoUrl: z.string().max(4096).optional().nullable(),
  experienceConfig: z.object({
    layoutID: LayoutSchema.optional(),
    themeConfig: ThemeConfigSchema.optional(),
    designSystem: z.object({ config: ThemeConfigSchema, appliedPreset: z.string().max(100).optional().nullable() }).passthrough().optional(),
  }).passthrough(),
});

export function themePayload(config, appliedPreset = null) {
  return { brandColor: config.colors?.brand?.primary, fontFamily: config.typography?.fonts?.heading?.family,
    logoUrl: config.logoUrl || '', experienceConfig: { layoutID: config.layoutID || 'grid', themeConfig: config, designSystem: { config, appliedPreset } } };
}

export function stableTheme(value) {
  return JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
}

// One controller owns one iframe. Both strategies use this exact validation,
// handshake, equality suppression, revision and acknowledgement implementation.
export function createPreviewController({ target, origin, requestFrame, cancelFrame, strategy = 'coalesced', onEvent = () => {} }) {
  let latest = null, fingerprint = null, revision = 0, frame = null;
  let connection = null, session = null, sent = 0, acknowledged = 0, disposed = false;
  const post = message => target()?.postMessage(message, origin);
  const flush = () => {
    frame = null;
    if (disposed || !session || !latest || sent === revision) return;
    sent = revision;
    post({ type: 'THEME_UPDATE', connection, session, revision, data: latest });
    onEvent({ type: 'sent', revision, data: latest });
  };
  const schedule = () => {
    if (!session || !latest) return;
    if (strategy === 'immediate') flush();
    else if (frame === null) frame = requestFrame(flush);
  };
  return {
    update(data) {
      if (disposed) return false;
      const result = ThemePreviewSchema.safeParse(data);
      if (!result.success) { onEvent({ type: 'invalid' }); return false; }
      const next = stableTheme(result.data);
      if (next === fingerprint) return revision;
      latest = result.data; fingerprint = next; revision++;
      onEvent({ type: 'edit', revision, data: latest }); schedule(); return revision;
    },
    connect(id) { connection = id; session = null; sent = 0; acknowledged = 0; if (frame !== null) cancelFrame(frame); frame = null; this.hello(); },
    hello() { if (!disposed && !session) post({ type: 'THEME_HELLO', connection }); },
    receive(event) {
      if (disposed || event.origin !== origin || event.source !== target()) return false;
      const msg = event.data;
      if (!msg || msg.connection !== connection) return false;
      if (msg.type === 'THEME_READY' && typeof msg.session === 'string') {
        if (session && session !== msg.session) return false;
        session = msg.session; schedule(); onEvent({ type: 'ready' }); return true;
      }
      if (msg.type === 'THEME_ACK' && msg.session === session && Number.isSafeInteger(msg.revision)
          && msg.revision > acknowledged && msg.revision <= sent) {
        acknowledged = msg.revision; onEvent({ ...msg, type: 'ack' }); return true;
      }
      return false;
    },
    snapshot() { return { latest, revision, sent, acknowledged, connection, session }; },
    dispose() { disposed = true; if (frame !== null) cancelFrame(frame); },
  };
}
