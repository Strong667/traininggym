import { useNavigate } from 'react-router-dom';
import { Flame, Music, Play, Pause } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMusic } from '../context/MusicContext';
import { getExerciseById } from '../data/exercises';
import defaultPlan from '../data/workoutPlan';
import { getTodayDayIndex, DAY_NAMES } from '../data/workoutPlan';
import ProgressBar from '../components/ProgressBar';
import WeekCalendar from '../components/WeekCalendar';
import ExerciseItem from '../components/ExerciseItem';
import RestTimer from '../components/RestTimer';

export default function Today() {
  const navigate = useNavigate();
  const { toggleExercise, isExerciseDone, getDoneExerciseIds, isDayDone, markDayDone, getStreak, todayKey, customPlan } = useApp();
  const { openSheet, current, isPlaying, toggle } = useMusic();

  const plan = customPlan || defaultPlan;
  const todayIndex = getTodayDayIndex();
  const workout = plan.find(d => d.dayIndex === todayIndex) || plan[0];
  const dateKey = todayKey();
  const exercises = workout.exerciseIds.map(id => getExerciseById(id)).filter(Boolean);
  const doneIds = getDoneExerciseIds(dateKey);
  const doneCount = doneIds.length;
  const total = exercises.length;
  const streak = getStreak();

  const now = new Date();
  const dateLabel = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  function handleToggle(exerciseId) {
    toggleExercise(dateKey, exerciseId);
    const newDone = isExerciseDone(dateKey, exerciseId)
      ? doneIds.filter(id => id !== exerciseId)
      : [...doneIds, exerciseId];
    if (newDone.length === total && total > 0) {
      markDayDone(dateKey, true);
    } else {
      markDayDone(dateKey, false);
    }
  }

  const allDone = doneCount === total && total > 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-screen pb-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{dateLabel}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
            {DAY_NAMES[todayIndex]}
          </h1>
          <p className="text-sm text-orange-500 font-medium">{workout.name}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 rounded-2xl px-3 py-1.5">
            <Flame size={18} className="text-orange-500" />
            <span className="font-bold text-orange-500">{streak}</span>
            <span className="text-xs text-orange-400">дн</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <WeekCalendar todayIndex={todayIndex} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <ProgressBar done={doneCount} total={total} />
      </div>

      {/* Музыка для тренировки */}
      <button
        onClick={openSheet}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-orange-400/5 hover:from-orange-500/15 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl p-4 transition-colors active:scale-[0.99]"
      >
        <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
          {current && isPlaying ? <Pause size={20} /> : <Music size={20} />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          {current ? (
            <>
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{current.title}</p>
              <p className="text-xs text-gray-400 truncate">{current.artist}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Музыка для тренировки</p>
              <p className="text-xs text-gray-400">Включи трек и погнали 🎧</p>
            </>
          )}
        </div>
        {current && (
          <span
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            className="p-2 text-orange-500 shrink-0"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
          </span>
        )}
      </button>

      {allDone && (
        <div className="text-center bg-green-500/10 border border-green-500/20 rounded-2xl py-3 px-4">
          <p className="text-green-600 dark:text-green-400 font-semibold">Тренировка завершена! Отличная работа 🎉</p>
        </div>
      )}

      <div className="space-y-2">
        {exercises.map(exercise => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            done={isExerciseDone(dateKey, exercise.id)}
            onToggle={() => handleToggle(exercise.id)}
            onDetail={() => navigate(`/library/${exercise.id}`)}
          />
        ))}
      </div>

      <RestTimer />
    </div>
  );
}
