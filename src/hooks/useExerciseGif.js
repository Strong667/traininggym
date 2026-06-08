import { useState, useEffect, useRef } from 'react';

// ── API endpoints ──────────────────────────────────────────────
const WORKOUTX_BASE  = 'https://api.workoutxapp.com/v1';
const ASCEND_BASE    = 'https://oss.exercisedb.dev/api/v1';
const FREE_DB_JSON   = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FREE_DB_IMG    = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// ── Cache keys & TTLs ──────────────────────────────────────────
const WXID_PREFIX    = 'wd_wxid_';
const WXID_TTL       = 30 * 24 * 60 * 60 * 1000;
const ASC_PREFIX     = 'wd_asc_';
const ASC_TTL        = 7  * 24 * 60 * 60 * 1000;
const FREE_DB_KEY    = 'wd_freedb_slim';
const FREE_DB_TTL    = 7  * 24 * 60 * 60 * 1000;
const IMG_PREFIX     = 'wd_img_';
const IMG_TTL        = 30 * 24 * 60 * 60 * 1000;

// Module-level free-db cache
let freeDb    = null;
let freeDbReq = null;

// ── localStorage helpers ───────────────────────────────────────

function lsGet(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const { v, ts } = JSON.parse(raw);
    return Date.now() - ts < ttl ? v : undefined;
  } catch { return undefined; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify({ v: value, ts: Date.now() })); } catch {}
}

function getWorkoutxKey() {
  try {
    const s = localStorage.getItem('wd_settings');
    return s ? (JSON.parse(s).workoutxKey || '') : '';
  } catch { return ''; }
}

// ── name matching ──────────────────────────────────────────────

function norm(s) {
  return s.toLowerCase().replace(/[-_']/g, ' ').replace(/\s+/g, ' ').trim();
}

function bestMatch(list, nameEn) {
  if (!list?.length) return null;
  const q = norm(nameEn);
  return (
    list.find(e => norm(e.name) === q) ||
    list.find(e => norm(e.name).includes(q)) ||
    list.find(e => q.includes(norm(e.name))) ||
    list.find(e => norm(e.name).startsWith(q.split(' ').slice(0, 2).join(' '))) ||
    list.find(e => norm(e.name).startsWith(q.split(' ')[0])) ||
    null
  );
}

// ── Source 1: WorkoutX (blob fetch, requires API key) ─────────

async function getWorkoutxId(exercise, apiKey) {
  const cached = lsGet(WXID_PREFIX + exercise.id, WXID_TTL);
  if (cached !== undefined) return cached;
  const res = await fetch(
    `${WORKOUTX_BASE}/exercises/name/${encodeURIComponent(exercise.nameEn.toLowerCase())}?limit=10`,
    { headers: { 'X-WorkoutX-Key': apiKey } }
  );
  if (!res.ok) throw new Error(`WorkoutX ${res.status}`);
  const json = await res.json();
  const match = bestMatch(json.data || [], exercise.nameEn);
  const wxId = match?.id || '';
  lsSet(WXID_PREFIX + exercise.id, wxId);
  return wxId;
}

async function fetchGifBlob(wxId, apiKey) {
  const res = await fetch(
    `${WORKOUTX_BASE}/gifs/${wxId}.gif`,
    { headers: { 'X-WorkoutX-Key': apiKey } }
  );
  if (!res.ok) throw new Error(`GIF ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

async function tryWorkoutX(exercise, wxKey, blobRef) {
  const wxId = await getWorkoutxId(exercise, wxKey);
  if (!wxId) return null;
  const objectUrl = await fetchGifBlob(wxId, wxKey);
  if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  blobRef.current = objectUrl;
  return { src: objectUrl, type: 'gif', source: 'workoutx' };
}

// ── Source 2: AscendAPI/oss.exercisedb.dev (free, no key) ─────

async function tryAscendApi(exercise) {
  const cached = lsGet(ASC_PREFIX + exercise.id, ASC_TTL);
  if (cached !== undefined) return cached ? { src: cached, type: 'gif', source: 'ascend' } : null;

  const query = encodeURIComponent(exercise.nameEn.toLowerCase());
  const res = await fetch(`${ASCEND_BASE}/exercises?name=${query}&limit=10`);
  if (!res.ok) throw new Error(`AscendAPI ${res.status}`);
  const json = await res.json();
  const list = json.data || [];
  const match = bestMatch(list, exercise.nameEn);
  const gifUrl = match?.gifUrl || '';

  lsSet(ASC_PREFIX + exercise.id, gifUrl);
  return gifUrl ? { src: gifUrl, type: 'gif', source: 'ascend' } : null;
}

// ── Source 3: free-exercise-db GitHub (static images, no key) ─

async function loadFreeDb() {
  if (freeDb) return freeDb;
  const cached = lsGet(FREE_DB_KEY, FREE_DB_TTL);
  if (cached) { freeDb = cached; return cached; }
  if (!freeDbReq) {
    freeDbReq = fetch(FREE_DB_JSON)
      .then(r => r.json())
      .then(data => {
        const slim = data.map(e => ({ id: e.id, name: e.name, images: e.images }));
        lsSet(FREE_DB_KEY, slim);
        freeDb = slim;
        freeDbReq = null;
        return slim;
      })
      .catch(() => { freeDbReq = null; return []; });
  }
  return freeDbReq;
}

async function tryFreeDb(exercise) {
  const cached = lsGet(IMG_PREFIX + exercise.id, IMG_TTL);
  if (cached !== undefined) return cached ? { src: cached, type: 'image', source: 'freedb' } : null;

  const db = await loadFreeDb();
  const match = bestMatch(db, exercise.nameEn);
  const url = match?.images?.[0] ? FREE_DB_IMG + match.images[0] : '';
  lsSet(IMG_PREFIX + exercise.id, url);
  return url ? { src: url, type: 'image', source: 'freedb' } : null;
}

// ── hook ───────────────────────────────────────────────────────

export default function useExerciseGif(exercise) {
  const [state, setState] = useState({ src: null, type: null, source: null, loading: !!exercise?.id });
  const [imgError, setImgError] = useState(false);
  const blobRef = useRef(null);

  useEffect(() => () => {
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
  }, []);

  useEffect(() => {
    if (!exercise?.id || !exercise?.nameEn) {
      setState({ src: null, type: null, source: null, loading: false });
      return;
    }

    let cancelled = false;
    setImgError(false);
    setState(s => ({ ...s, loading: true }));

    const wxKey = getWorkoutxKey();

    async function run() {
      // 1. WorkoutX animated GIF (if key set)
      if (wxKey) {
        try {
          const result = await tryWorkoutX(exercise, wxKey, blobRef);
          if (result && !cancelled) { setState({ ...result, loading: false }); return; }
        } catch { /* fall through */ }
      }

      // 2. AscendAPI free GIFs (no key required)
      try {
        const result = await tryAscendApi(exercise);
        if (result && !cancelled) { setState({ ...result, loading: false }); return; }
      } catch { /* fall through */ }

      // 3. free-exercise-db static images (final fallback)
      try {
        const result = await tryFreeDb(exercise);
        if (!cancelled) setState(result ? { ...result, loading: false } : { src: null, type: null, source: null, loading: false });
      } catch {
        if (!cancelled) setState({ src: null, type: null, source: null, loading: false });
      }
    }

    run();
    return () => { cancelled = true; };
  }, [exercise?.id]);

  return {
    gifSrc:     state.src,
    mediaType:  state.type,    // 'gif' | 'image' | null
    gifSource:  state.source,  // 'workoutx' | 'ascend' | 'freedb' | null
    loading:    state.loading,
    imgError,
    onImgError: () => setImgError(true),
  };
}
