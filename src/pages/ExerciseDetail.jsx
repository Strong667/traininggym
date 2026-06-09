import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lightbulb, Loader2, WifiOff, Image } from 'lucide-react';
import { MUSCLE_GROUPS, EQUIPMENT_LABELS, formatSetsReps } from '../data/exercises';
import useExerciseGif from '../hooks/useExerciseGif';
import { useExerciseById } from '../hooks/useAllExercises';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = useExerciseById(id);

  if (!exercise) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center text-gray-400">
        <p>Упражнение не найдено</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-500">Назад</button>
      </div>
    );
  }

  const group = MUSCLE_GROUPS[exercise.muscle];

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pb-3 pt-bar flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white truncate">{exercise.name}</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <GifBlock exercise={exercise} group={group} />

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Подходы × Повт.</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{formatSetsReps(exercise)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Оборудование</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{EQUIPMENT_LABELS[exercise.equipment]}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <CheckCircle size={18} className="text-orange-500" />
            Техника выполнения
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{exercise.description}</p>
        </div>

        {exercise.tips?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-500" />
              Советы
            </h2>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function GifBlock({ exercise, group }) {
  const { gifSrc, mediaType, gifSource, loading, imgError, onImgError } = useExerciseGif(exercise);
  const showMedia = gifSrc && !imgError;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      style={{ minHeight: 220 }}
    >
      {/* Emoji fallback always behind */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
        <span className="text-7xl">{group?.icon || '💪'}</span>
        <span className={`text-sm font-medium ${group?.color || 'text-gray-400'}`}>{group?.label}</span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Загружаю изображение...</span>
          </div>
        </div>
      )}

      {/* Media image */}
      {showMedia && (
        <img
          src={gifSrc}
          alt={exercise.name}
          onError={onImgError}
          loading="lazy"
          className="relative w-full object-contain rounded-2xl"
          style={{ maxHeight: 320 }}
        />
      )}

      {/* Badge bottom-right */}
      {showMedia && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {mediaType === 'gif' ? (
            <span>GIF · {gifSource === 'workoutx' ? 'WorkoutX' : 'ExerciseDB'}</span>
          ) : (
            <><Image size={10} /><span>Фото · free-exercise-db</span></>
          )}
        </div>
      )}

      {/* Failed to load — no badge, emoji already visible */}
      {!loading && !showMedia && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white/50 text-[10px] px-2 py-0.5 rounded-full">
          <WifiOff size={10} />
          <span>Изображение недоступно</span>
        </div>
      )}
    </div>
  );
}
