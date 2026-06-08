import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

const PRESETS = [30, 60, 90];

export default function RestTimer() {
  const [selected, setSelected] = useState(60);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function start(seconds) {
    clearInterval(intervalRef.current);
    setSelected(seconds);
    setRemaining(seconds);
    setRunning(true);
    setOpen(true);
  }

  function toggle() {
    if (remaining === 0) {
      start(selected);
    } else {
      setRunning(r => !r);
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(null);
  }

  const display = remaining !== null ? remaining : selected;
  const mins = Math.floor(display / 60);
  const secs = display % 60;
  const pct = remaining !== null ? ((selected - remaining) / selected) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
          <Timer size={18} className="text-orange-500" />
          <span>Таймер отдыха</span>
        </div>
        {running && (
          <span className="text-orange-500 font-mono font-semibold text-sm">
            {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}с`}
          </span>
        )}
        <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex gap-2 justify-center">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => start(p)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selected === p && remaining !== null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }`}
              >
                {p}с
              </button>
            ))}
          </div>

          {remaining !== null && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-gray-200 dark:text-gray-700" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeDasharray="100" strokeDashoffset={100 - pct}
                    strokeLinecap="round"
                    className="text-orange-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono font-bold text-xl text-gray-800 dark:text-gray-100">
                    {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={toggle}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                >
                  {running ? <Pause size={16} /> : <Play size={16} />}
                  {running ? 'Пауза' : remaining === 0 ? 'Заново' : 'Старт'}
                </button>
                <button
                  onClick={reset}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {remaining === 0 && (
                <p className="text-green-500 font-semibold text-sm animate-pulse">
                  Время! Продолжай тренировку 💪
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
