// Audius — бесплатный открытый музыкальный API (без ключа).
// Документация: https://docs.audius.org/
const HOST = 'https://api.audius.co';
const APP  = 'TrainingGym';

function normalize(t) {
  return {
    id: t.id,
    title: t.title,
    artist: t.user?.name || t.user?.handle || 'Unknown',
    duration: t.duration || 0,
    genre: t.genre || '',
    artwork: t.artwork?.['150x150'] || t.artwork?.['480x480'] || null,
    artworkLarge: t.artwork?.['480x480'] || t.artwork?.['1000x1000'] || t.artwork?.['150x150'] || null,
  };
}

export async function searchTracks(query, limit = 30) {
  const url = `${HOST}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Audius search ' + res.status);
  const json = await res.json();
  return (json.data || [])
    .filter(t => t.is_streamable !== false && !t.is_delete)
    .map(normalize);
}

export function streamUrl(id) {
  return `${HOST}/v1/tracks/${id}/stream?app_name=${APP}`;
}

// Пресеты под тренировку (поисковые запросы)
export const MUSIC_PRESETS = [
  { label: 'Workout', query: 'workout motivation' },
  { label: 'Phonk',   query: 'gym phonk' },
  { label: 'EDM',     query: 'edm workout' },
  { label: 'Hip-Hop', query: 'hip hop workout' },
  { label: 'Бег',     query: 'running music' },
  { label: 'Hardstyle', query: 'hardstyle' },
];

export function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
