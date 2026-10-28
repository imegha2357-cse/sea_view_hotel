// Downloads every photo listed in src/data/images.js from hotelseaview.in into public/images.
// Run once on your machine: npm run fetch-images   then set VITE_IMAGE_SOURCE=local in .env
import { mkdir, writeFile, access } from 'node:fs/promises';
import { IMAGE_MANIFEST, localName, remoteUrl } from '../src/data/images.js';

const out = new URL('../public/images/', import.meta.url);
await mkdir(out, { recursive: true });

let ok = 0;
let failed = 0;
for (const [key, { path }] of Object.entries(IMAGE_MANIFEST)) {
  const file = new URL(localName(path), out);
  try {
    await access(file);
    console.log(`skip   ${key} (already downloaded)`);
    ok++;
    continue;
  } catch {}
  try {
    const res = await fetch(remoteUrl(path));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`saved  ${key} -> public/images/${localName(path)}`);
    ok++;
  } catch (err) {
    console.error(`failed ${key}: ${err.message}`);
    failed++;
  }
}
console.log(`\n${ok} saved, ${failed} failed.${failed ? '' : ' Now set VITE_IMAGE_SOURCE=local in .env'}`);
