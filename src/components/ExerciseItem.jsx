import { CheckCircle, Circle } from 'lucide-react';
import { formatSetsReps } from '../data/exercises';
import { MUSCLE_GROUPS } from '../data/exercises';

export default function ExerciseItem({ exercise, done, onToggle, onDetail }) {
  const group = MUSCLE_GROUPS[exercise.muscle];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        done
          ? 'bg-green-500/10 dark:bg-green-500/10'
          : 'bg-gray-50 dark:bg-gray-800/60'
      }`}
    >
      <button
        onClick={onToggle}
        className={`shrink-0 transition-colors ${done ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-orange-400'}`}
      >
        {done ? <CheckCircle size={24} /> : <Circle size={24} />}
      </button>

      <button className="flex-1 text-left min-w-0" onClick={onDetail}>
        <p className={`font-medium leading-tight truncate ${done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
          {exercise.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${group?.color || 'text-gray-400'}`}>{group?.label}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatSetsReps(exercise)}</span>
        </div>
      </button>

      <span className="shrink-0 text-gray-300 dark:text-gray-600 text-xs">›</span>
    </div>
  );
}
