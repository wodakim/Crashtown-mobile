import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public/Assets/Sounds/Onroad/radio');
const STATION_PREFIX = 'radio_';

async function listMp3Files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp3'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function main() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const stations = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith(STATION_PREFIX));

  for (const station of stations) {
    const stationDir = path.join(ROOT, station.name);
    const tracks = await listMp3Files(stationDir);
    const payload = {
      station: station.name,
      tracks,
    };
    await fs.writeFile(path.join(stationDir, 'playlist.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`${station.name}: ${tracks.length} tracks`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
