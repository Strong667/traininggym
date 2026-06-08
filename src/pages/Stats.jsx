import { useApp } from '../context/AppContext';
import { Flame, Dumbbell, CheckSquare, TrendingUp } from 'lucide-react';

export default function Stats() {
  const { getStreak, getLast14Days, getTotalWorkouts, getTotalExercisesDone } = useApp();

  const streak = getStreak();
  const last14 = getLast14Days();
  const totalWorkouts = getTotalWorkouts();
  const totalExercises = getTotalExercisesDone();

  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // 4-week heatmap (28 days)
  const heatmap = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Статистика</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Flame size={22} className="text-orange-500" />} label="Серия" value={streak} unit="дней" bg="from-orange-500/10 to-orange-400/5" />
        <StatCard icon={<Dumbbell size={22} className="text-blue-500" />} label="Тренировок" value={totalWorkouts} unit="всего" bg="from-blue-500/10 to-blue-400/5" />
        <StatCard icon={<CheckSquare size={22} className="text-green-500" />} label="Упражнений" value={totalExercises} unit="выполнено" bg="from-green-500/10 to-green-400/5" />
        <StatCard icon={<TrendingUp size={22} className="text-purple-500" />} label="За 14 дней" value={last14.filter(d => d.done).length} unit="активных" bg="from-purple-500/10 to-purple-400/5" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Последние 14 дней</h2>
        <div className="flex gap-1.5 flex-wrap">
          {last14.map(day => (
            <div key={day.key} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors ${
                day.done
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {day.date.getDate()}
              </div>
              <span className="text-[9px] text-gray-300 dark:text-gray-600">
                {dayLabels[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Активность за месяц</h2>
        <HeatmapGrid days={heatmap} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, bg }) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-700`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span></div>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{unit}</p>
    </div>
  );
}

function HeatmapGrid({ days }) {
  const { doneByDate } = useApp();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {week.map((d, di) => {
            const key = d.toISOString().slice(0, 10);
            const done = !!doneByDate[key];
            const isToday = key === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={di}
                title={`${key}${done ? ' ✓' : ''}`}
                className={`w-8 h-8 rounded-md transition-colors ${
                  done ? 'bg-orange-500' : 'bg-gray-100 dark:bg-gray-700'
                } ${isToday ? 'ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-gray-800' : ''}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
