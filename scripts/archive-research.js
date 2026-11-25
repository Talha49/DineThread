// Preserve raw local evidence, including failed pilots. Never synthesise results.
const fs = require('node:fs/promises');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
async function main() {
    const root = path.resolve(__dirname, '..'), member = process.argv[2];
    if (!/^[a-z-]+$/.test(member || '')) throw new Error('Supply the research folder name');
    const destination = path.join(root, 'research', member, 'evidence');
    await fs.mkdir(destination, { recursive: true });
    const manifest = [];
    for (const input of process.argv.slice(3)) {
        const source = path.resolve(root, input);
        if (!source.startsWith(path.join(root, 'qa-results') + path.sep)) throw new Error('Only local qa-results evidence is accepted');
        for (const entry of await fs.readdir(source, { withFileTypes: true })) {
            if (!entry.isFile()) continue;
            const bytes = await fs.readFile(path.join(source, entry.name));
            const compressed = !/\.(png|jpg|zip|gz)$/.test(entry.name);
            const name = path.basename(source) + '--' + entry.name + (compressed ? '.gz' : '');
            const stored = compressed ? gzipSync(bytes) : bytes;
            await fs.writeFile(path.join(destination, name), stored);
            manifest.push({ source: path.relative(root, path.join(source, entry.name)).replaceAll('\\', '/'), file: name, originalBytes: bytes.length, originalSha256: createHash('sha256').update(bytes).digest('hex'), storedSha256: createHash('sha256').update(stored).digest('hex') });
        }
    }
    const file = path.join(destination, 'manifest.json');
    let existing = []; try { existing = JSON.parse(await fs.readFile(file)); } catch {}
    const combined = new Map([...existing, ...manifest].map(item => [item.file, item]));
    await fs.writeFile(file, JSON.stringify([...combined.values()], null, 2));
    console.log(`Archived ${manifest.length} files in ${destination}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
