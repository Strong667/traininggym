import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
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
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">
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
