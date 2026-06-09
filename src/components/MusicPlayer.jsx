import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, X, Search, Loader2, Disc3, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { searchTracks, MUSIC_PRESETS, formatTime } from '../lib/audius';

// Позиции над фиксированным NavBar (учитывая home indicator).
// FAB заметно выше панели, чтобы не сливался с навбаром.
const MINI_BOTTOM = 'calc(4.25rem + env(safe-area-inset-bottom))';
const FAB_BOTTOM  = 'calc(5.5rem + env(safe-area-inset-bottom))';

const IS_IOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

export default function MusicPlayer() {
  const { current, isPlaying, toggle, next, prev, progress, queue, index, sheetOpen, openSheet, closeSheet } = useMusic();

  return (
    <>
      {/* Выезжающая панель поиска/списка */}
      {sheetOpen && <MusicSheet onClose={closeSheet} />}

      {/* Мини-плеер (когда есть трек) */}
      {current && !sheetOpen && (
        <div
          className="fixed left-0 right-0 z-40 px-3"
          style={{ bottom: MINI_BOTTOM }}
        >
          <div className="max-w-lg mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
            {/* прогресс-полоса */}
            <div className="h-0.5 bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-orange-500 transition-[width] duration-300"
                style={{ width: progress.duration ? `${(progress.time / progress.duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <button onClick={openSheet} className="shrink-0">
                {current.artwork
                  ? <img src={current.artwork} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  : <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Music size={18} className="text-orange-500" /></div>}
              </button>
              <button onClick={openSheet} className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{current.title}</p>
                <p className="text-xs text-gray-400 truncate">{current.artist}</p>
              </button>
              <button onClick={prev} disabled={index <= 0}
                className="p-1.5 text-gray-500 dark:text-gray-400 disabled:opacity-30">
                <SkipBack size={18} />
              </button>
              <button onClick={toggle}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
              </button>
              <button onClick={next} disabled={index >= queue.length - 1}
                className="p-1.5 text-gray-500 dark:text-gray-400 disabled:opacity-30">
                <SkipForward size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB — открыть музыку, когда ничего не играет */}
      {!current && !sheetOpen && (
        <button
          onClick={openSheet}
          className="fixed right-4 z-40 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-transform"
          style={{ bottom: FAB_BOTTOM }}
          aria-label="Музыка"
        >
          <Music size={22} />
        </button>
      )}
    </>
  );
}

function MusicSheet({ onClose }) {
  const { playAt, current, isPlaying, toggle, progress, seek, volume, setVolume } = useMusic();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [activePreset, setActivePreset] = useState(MUSIC_PRESETS[0].label);
  const inputRef = useRef(null);

  async function run(q, presetLabel = null) {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setActivePreset(presetLabel);
    try {
      const tracks = await searchTracks(q.trim());
      setResults(tracks);
      if (tracks.length === 0) setError('Ничего не найдено');
    } catch {
      setError('Не удалось загрузить. Проверьте интернет.');
    } finally {
      setLoading(false);
    }
  }

  // Загрузить первый пресет при открытии
  useEffect(() => { run(MUSIC_PRESETS[0].query, MUSIC_PRESETS[0].label); }, []);

  function onSubmit(e) {
    e.preventDefault();
    run(query, null);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-bar pb-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Disc3 size={20} className="text-orange-500" />
          <h2 className="flex-1 font-bold text-gray-900 dark:text-white">Музыка для тренировки</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={22} />
          </button>
        </div>

        {/* Поиск */}
        <form onSubmit={onSubmit} className="max-w-lg mx-auto mt-3 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск трека или исполнителя..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </form>

        {/* Пресеты */}
        <div className="max-w-lg mx-auto mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {MUSIC_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setQuery(''); run(p.query, p.label); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activePreset === p.label
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-lg mx-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-orange-500" />
            </div>
          )}
          {!loading && error && (
            <p className="text-center text-gray-400 py-12 text-sm">{error}</p>
          )}
          {!loading && !error && (
            <div className="space-y-1">
              {results.map((track, i) => {
                const isCurrent = current?.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => isCurrent ? toggle() : playAt(results, i)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                      isCurrent ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {track.artwork
                        ? <img src={track.artwork} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        : <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Music size={18} className="text-orange-500" /></div>}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                          {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white translate-x-0.5" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-white'}`}>{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatTime(track.duration)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Нижняя плашка текущего трека внутри панели */}
      {current && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 pb-safe space-y-2.5">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {current.artwork
              ? <img src={current.artwork} alt="" className="w-11 h-11 rounded-lg object-cover" />
              : <div className="w-11 h-11 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Music size={18} className="text-orange-500" /></div>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{current.title}</p>
              <p className="text-xs text-gray-400 truncate">{current.artist}</p>
            </div>
            <button onClick={toggle} className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full">
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
            </button>
          </div>

          {/* Перемотка */}
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <span className="text-[10px] text-gray-400 tabular-nums w-9 text-right">{formatTime(progress.time)}</span>
            <input
              type="range"
              min={0}
              max={progress.duration || 0}
              step="any"
              value={Math.min(progress.time, progress.duration || 0)}
              onChange={e => seek(Number(e.target.value))}
              className="flex-1 accent-orange-500 h-1 cursor-pointer"
              aria-label="Перемотка"
            />
            <span className="text-[10px] text-gray-400 tabular-nums w-9">{formatTime(progress.duration)}</span>
          </div>

          {/* Громкость (на iOS управляется только аппаратными кнопками) */}
          {!IS_IOS && (
            <div className="max-w-lg mx-auto flex items-center gap-2">
              <button onClick={() => setVolume(volume > 0 ? 0 : 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="0.01"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="flex-1 accent-orange-500 h-1 cursor-pointer"
                aria-label="Громкость"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
