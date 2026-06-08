import { useNavigate } from 'react-router-dom';
import { MUSCLE_GROUPS, EQUIPMENT_LABELS, formatSetsReps } from '../data/exercises';
import useExerciseGif from '../hooks/useExerciseGif';

export default function ExerciseCard({ exercise }) {
  const navigate = useNavigate();
  const group = MUSCLE_GROUPS[exercise.muscle];
  const { gifSrc, mediaType, loading, imgError, onImgError } = useExerciseGif(exercise);

  const showMedia = gifSrc && !imgError;

  return (
    <button
      onClick={() => navigate(`/library/${exercise.id}`)}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-md active:scale-[0.98] overflow-hidden"
    >
      <div className="relative w-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden" style={{ height: 110 }}>
        {/* Emoji always behind as fallback */}
        <span className="text-4xl select-none">{group?.icon || '💪'}</span>

        {/* Loading shimmer */}
        {loading && (
          <div className="absolute inset-0 bg-gray-200/60 dark:bg-gray-700/60 animate-pulse" />
        )}

        {/* GIF or image */}
        {showMedia && (
          <img
            src={gifSrc}
            alt={exercise.name}
            onError={onImgError}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* GIF badge — only when animated */}
        {mediaType === 'gif' && showMedia && (
          <span className="absolute bottom-1 left-1 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold tracking-wide">
            GIF
          </span>
        )}

        {/* Muscle group badge */}
        <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm font-medium ${group?.color || 'text-gray-400'}`}>
          {group?.label}
        </span>
      </div>

      <div className="p-3">
        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">{exercise.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatSetsReps(exercise)}</span>
          <span className="text-gray-200 dark:text-gray-700">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{EQUIPMENT_LABELS[exercise.equipment]}</span>
        </div>
      </div>
    </button>
  );
}
