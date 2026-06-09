import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Dumbbell, CheckSquare, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Stats() {
  const { getStreak, getLast14Days, getTotalWorkouts, getTotalExercisesDone } = useApp();

  const streak = getStreak();
  const last14 = getLast14Days();
  const totalWorkouts = getTotalWorkouts();
  const totalExercises = getTotalExercisesDone();

  return (
    <div className="max-w-lg mx-auto px-4 pt-screen pb-4 space-y-5">
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
                {DAY_LABELS[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Активность за месяц</h2>
        <HeatmapGrid />
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

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAY_LABELS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function HeatmapGrid() {
  const { doneByDate } = useApp();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { year, month } = view;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Пн=0 ... Вс=6
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Запрет на навигацию в будущее (нет данных)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  function shift(delta) {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, key, done: !!doneByDate[key], isToday: key === todayKey });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => shift(-1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{MONTH_NAMES[month]} {year}</p>
        <button
          onClick={() => shift(1)}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
          aria-label="Следующий месяц"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium pb-0.5">{d}</div>
        ))}
        {cells.map((cell, i) =>
          cell ? (
            <div
              key={i}
              title={`${cell.key}${cell.done ? ' ✓' : ''}`}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors ${
                cell.done
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              } ${cell.isToday ? 'ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-gray-800' : ''}`}
            >
              {cell.day}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </>
  );
}
