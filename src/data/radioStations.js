export const RADIO_STATION_PREF_KEY = "ct_radio_station_v1";

export const RADIO_STATIONS = [
  { id: "radio_happyness", label: "Happyness FM" },
  { id: "radio_internationnal", label: "International Hits" },
  { id: "radio_phonk", label: "Phonk Drive" },
  { id: "radio_random", label: "Random Mix" },
  { id: "radio_rap", label: "Rap Street" },
  { id: "radio_rock", label: "Rock Route" },
];

const TRACK_FILENAMES = [
  "Sound_music_onroad_playsong1_sample_v01.mp3",
  "Sound_music_onroad_playsong2_sample_v01.mp3",
  "Sound_music_onroad_playsong3_loopX3_sample_v01.mp3",
  "Sound_music_onroad_song_fellas_sample_v01.mp3",
];

export function buildStationTracks(stationId) {
  const stationBase = `/Assets/Sounds/Onroad/radio/${stationId}`;
  const legacyBase = `/Assets/Sounds/Onroad/radio`;
  const candidates = [
    ...TRACK_FILENAMES.map((name) => `${stationBase}/${name}`),
    ...TRACK_FILENAMES.map((name) => `${legacyBase}/${name}`),
  ];
  return [...new Set(candidates)];
}

export function isKnownStation(stationId) {
  return RADIO_STATIONS.some((station) => station.id === stationId);
}
