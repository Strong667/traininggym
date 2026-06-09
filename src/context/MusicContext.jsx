import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { streamUrl } from '../lib/audius';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
  }

  const [queue, setQueue]         = useState([]);
  const [index, setIndex]         = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress]   = useState({ time: 0, duration: 0 });

  const current = index >= 0 ? queue[index] : null;

  function playAt(q, i) {
    const a = audioRef.current;
    if (!a || !q[i]) return;
    setQueue(q);
    setIndex(i);
    a.src = streamUrl(q[i].id);
    a.play().catch(() => {});
  }

  function toggle() {
    const a = audioRef.current;
    if (!a || index < 0) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function next() { if (index >= 0 && index < queue.length - 1) playAt(queue, index + 1); }
  function prev() { if (index > 0) playAt(queue, index - 1); }
  function seek(t) { if (audioRef.current) audioRef.current.currentTime = t; }

  // Аудио-события (внутри effect — всегда свежие queue/index)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime  = () => setProgress({ time: a.currentTime, duration: a.duration || 0 });
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd   = () => { if (index < queue.length - 1) playAt(queue, index + 1); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnd);
    };
  }, [queue, index]);

  // MediaSession — управление с экрана блокировки / наушников
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: 'WorkoutTracker',
      artwork: current.artworkLarge ? [{ src: current.artworkLarge, sizes: '480x480', type: 'image/jpeg' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => toggle());
    navigator.mediaSession.setActionHandler('pause', () => toggle());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
  }, [current, queue, index]);

  return (
    <MusicContext.Provider value={{
      queue, index, current, isPlaying, progress,
      playAt, toggle, next, prev, seek,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be inside MusicProvider');
  return ctx;
}
