import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public/Assets/Sounds/Onroad/radio');
const STATION_PREFIX = 'radio_';
const STRICT = process.argv.includes('--strict');
const FAIL_ON_EMPTY = process.argv.includes('--fail-on-empty');

async function listMp3Files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp3'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function findDuplicates(items) {
  const seen = new Set();
  const dupes = new Set();
  items.forEach((item) => {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  });
  return [...dupes];
}

function validateTracks(stationName, tracks, { warnings, errors }) {
  if (!tracks.length) {
    const msg = `${stationName}: playlist vide`;
    if (FAIL_ON_EMPTY) errors.push(msg);
    else warnings.push(msg);
  }

  const duplicates = findDuplicates(tracks.map((t) => t.toLowerCase()));
  duplicates.forEach((dupe) => {
    errors.push(`${stationName}: doublon détecté -> ${dupe}`);
  });

  tracks.forEach((track) => {
    if (!track.toLowerCase().endsWith('.mp3')) {
      errors.push(`${stationName}: format invalide -> ${track}`);
    }
  });
}

async function main() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const stations = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith(STATION_PREFIX));
  const warnings = [];
  const errors = [];

  for (const station of stations) {
    const stationDir = path.join(ROOT, station.name);
    const tracks = await listMp3Files(stationDir);
    validateTracks(station.name, tracks, { warnings, errors });

    const payload = {
      station: station.name,
      tracks,
    };

    await fs.writeFile(path.join(stationDir, 'playlist.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`${station.name}: ${tracks.length} tracks`);
  }

  if (warnings.length) {
    console.warn('\n[radio:scan] avertissements:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (errors.length) {
    console.warn('\n[radio:scan] anomalies détectées:');
    errors.forEach((issue) => console.warn(`- ${issue}`));
  }

  if (STRICT && errors.length) {
    console.error(`\n[radio:scan] strict mode: ${errors.length} anomalie(s), arrêt avec code 1.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
