import { createPreviewController, themePayload, ThemeConfigSchema } from '@/lib/theme-preview';
import { DEFAULT_CONFIG } from '@/components/dashboard/design-studio/config-defaults';
import { UpdateBrandingSchema } from '@/lib/validations';
import { DESIGN_PRESETS } from '@/components/dashboard/design-studio/presets';

function fixture(strategy = 'coalesced') {
  const frames = new Map(); let id = 0;
  const target = { postMessage: jest.fn() }, events = [];
  const c = createPreviewController({ target: () => target, origin: 'https://menu.example', strategy,
    requestFrame: cb => { frames.set(++id, cb); return id; }, cancelFrame: n => frames.delete(n), onEvent: e => events.push(e) });
  c.connect('connection');
  const receive = msg => c.receive({ origin: 'https://menu.example', source: target, data: { connection: 'connection', session: 'document', ...msg } });
  receive({ type: 'THEME_READY' });
  return { c, target, events, frames, receive, tick() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb()); } };
}
const config = n => ({ ...DEFAULT_CONFIG, layoutID: 'grid', typography: { ...DEFAULT_CONFIG.typography, sizes: { ...DEFAULT_CONFIG.typography.sizes, base: 16 + n } } });

test.each(DESIGN_PRESETS.map(p => [p.name, p.config]))('existing preset %s remains valid', (_, value) => {
  expect(ThemeConfigSchema.safeParse(value).error?.issues || []).toEqual([]);
});

test('rapid edits use one pending frame and preserve the newest value', () => {
  const f = fixture(); for (let n = 0; n < 20; n++) f.c.update(themePayload(config(n)));
  expect(f.frames.size).toBe(1); expect(f.c.snapshot().latest.experienceConfig.themeConfig.typography.sizes.base).toBe(35);
  f.tick(); const messages = f.target.postMessage.mock.calls.filter(([m]) => m.type === 'THEME_UPDATE');
  expect(messages).toHaveLength(1); expect(messages[0][0].revision).toBe(20); expect(messages[0][1]).toBe('https://menu.example');
});
test('immediate strategy delivers every changed valid edit, unchanged suppression is shared', () => {
  const f = fixture('immediate'); for (let n = 0; n < 5; n++) f.c.update(themePayload(config(n)));
  f.c.update(themePayload(config(4))); expect(f.c.snapshot().sent).toBe(5);
  expect(f.target.postMessage.mock.calls.filter(([m]) => m.type === 'THEME_UPDATE')).toHaveLength(5);
});
test('invalid edits preserve the last valid draft and do not increment revision', () => {
  const f = fixture(); f.c.update(themePayload(config(1))); expect(f.c.update(themePayload(config(1000)))).toBe(false);
  expect(f.c.snapshot().revision).toBe(1); expect(f.c.snapshot().latest.experienceConfig.themeConfig.typography.sizes.base).toBe(17);
});
test('foreign senders, origins, future and older acknowledgements are ignored', () => {
  const f = fixture('immediate'); f.c.update(themePayload(config(1))); f.c.update(themePayload(config(2)));
  expect(f.c.receive({ source: f.target, origin: 'https://other.example', data: { type: 'THEME_ACK', connection: 'connection', session: 'document', revision: 2 } })).toBe(false);
  expect(f.c.receive({ source: {}, origin: 'https://menu.example', data: { type: 'THEME_ACK', connection: 'connection', session: 'document', revision: 2 } })).toBe(false);
  expect(f.receive({ type: 'THEME_ACK', revision: 99 })).toBe(false);
  expect(f.receive({ type: 'THEME_ACK', revision: 2 })).toBe(true);
  expect(f.receive({ type: 'THEME_ACK', revision: 1 })).toBe(false);
  expect(f.c.snapshot().acknowledged).toBe(2);
});
test('reloaded preview receives latest draft and old connection cannot acknowledge it', () => {
  const f = fixture(); f.c.update(themePayload(config(2))); f.tick(); f.c.connect('reload');
  expect(f.receive({ type: 'THEME_ACK', revision: 1 })).toBe(false);
  f.receive({ type: 'THEME_READY', connection: 'reload', session: 'new-document' }); f.tick();
  expect(f.target.postMessage.mock.calls.at(-1)[0]).toMatchObject({ revision: 1, connection: 'reload', session: 'new-document' });
});
test('schema accepts defaults and rejects invalid editable fields or conflicting persisted copies', () => {
  expect(ThemeConfigSchema.safeParse(DEFAULT_CONFIG).success).toBe(true);
  expect(ThemeConfigSchema.safeParse({ colors: { brand: { primary: 'not a colour' } } }).success).toBe(false);
  expect(ThemeConfigSchema.safeParse({ layoutID: 'unknown' }).success).toBe(false);
  const payload = themePayload(config(1)); payload.experienceConfig.themeConfig = config(2);
  expect(UpdateBrandingSchema.safeParse(payload).success).toBe(false);
});
