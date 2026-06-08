import { DAY_NAMES_SHORT } from '../data/workoutPlan';
import { useApp } from '../context/AppContext';
import { CheckCircle } from 'lucide-react';

export default function WeekCalendar({ todayIndex }) {
  const { doneByDate } = useApp();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const currentDayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const offset = i - currentDayIndex;
    d.setDate(d.getDate() + offset);
    const key = d.toISOString().slice(0, 10);
    return {
      dayIndex: i,
      label: DAY_NAMES_SHORT[i],
      key,
      date: d.getDate(),
      isToday: i === currentDayIndex,
      isDone: !!doneByDate[key],
    };
  });

  return (
    <div className="flex justify-between gap-1">
      {days.map(day => (
        <div key={day.dayIndex} className="flex-1 flex flex-col items-center gap-1">
          <span className={`text-[10px] font-medium ${day.isToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {day.label}
          </span>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
            ${day.isToday ? 'bg-orange-500 text-white ring-2 ring-orange-300 dark:ring-orange-700' : ''}
            ${day.isDone && !day.isToday ? 'bg-green-500/20 text-green-500' : ''}
            ${!day.isToday && !day.isDone ? 'text-gray-400 dark:text-gray-500' : ''}
          `}>
            {day.isDone ? <CheckCircle size={16} className={day.isToday ? 'text-white' : 'text-green-500'} /> : day.date}
          </div>
        </div>
      ))}
    </div>
  );
}
