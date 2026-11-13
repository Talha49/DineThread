// Build local experiments without reading private deployment credentials.
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const directory = process.argv[2];
if (!/^qa-results\/build-[a-z0-9-]+$/.test(directory || '')) throw new Error('Supply a fresh qa-results/build-name folder');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: root, windowsHide: true, stdio: 'inherit',
    env: { ...process.env, RESEARCH_DIST_DIR: directory, AUTH_SECRET: randomBytes(32).toString('hex'), MONGODB_URI: 'mongodb://127.0.0.1:1/build_only', NEXT_TELEMETRY_DISABLED: '1' },
});
process.exitCode = result.status ?? 1;
