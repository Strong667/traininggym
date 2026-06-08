import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const ENV_WX_KEY = import.meta.env.VITE_WORKOUTX_KEY || '';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('wd_theme', 'dark');
  const [doneByDate, setDoneByDate] = useLocalStorage('wd_done', {});
  const [exercisesByDate, setExercisesByDate] = useLocalStorage('wd_exercises', {});
  const [settings, setSettings] = useLocalStorage('wd_settings', {
    notificationTime: '08:00',
    language: 'ru',
    workoutxKey: ENV_WX_KEY,
  });
  const [customPlan, setCustomPlan] = useLocalStorage('wd_custom_plan', null);

  // Migrate: if localStorage was saved without workoutxKey, fill it from env
  useEffect(() => {
    if (!settings.workoutxKey && ENV_WX_KEY) {
      setSettings(prev => ({ ...prev, workoutxKey: ENV_WX_KEY }));
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDateKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  function toggleExercise(dateKey, exerciseId) {
    setExercisesByDate(prev => {
      const dayMap = prev[dateKey] || {};
      return { ...prev, [dateKey]: { ...dayMap, [exerciseId]: !dayMap[exerciseId] } };
    });
  }

  function isDayDone(dateKey) {
    return !!doneByDate[dateKey];
  }

  function markDayDone(dateKey, done = true) {
    setDoneByDate(prev => ({ ...prev, [dateKey]: done }));
  }

  function isExerciseDone(dateKey, exerciseId) {
    return !!(exercisesByDate[dateKey] && exercisesByDate[dateKey][exerciseId]);
  }

  function getDoneExerciseIds(dateKey) {
    return Object.keys(exercisesByDate[dateKey] || {}).filter(id => exercisesByDate[dateKey][id]);
  }

  function getStreak() {
    let streak = 0;
    const today = todayKey();
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (key === today && !doneByDate[key]) continue; // today not yet done doesn't break streak
      if (i > 0 && !doneByDate[key]) break;
      if (doneByDate[key]) streak++;
    }
    return streak;
  }

  function getLast14Days() {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, done: !!doneByDate[key], date: d });
    }
    return days;
  }

  function getTotalWorkouts() {
    return Object.values(doneByDate).filter(Boolean).length;
  }

  function getTotalExercisesDone() {
    let total = 0;
    for (const dateMap of Object.values(exercisesByDate)) {
      total += Object.values(dateMap).filter(Boolean).length;
    }
    return total;
  }

  function resetAllData() {
    setDoneByDate({});
    setExercisesByDate({});
    setCustomPlan(null);
  }

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      doneByDate,
      exercisesByDate,
      settings,
      setSettings,
      customPlan,
      setCustomPlan,
      toggleExercise,
      isDayDone,
      markDayDone,
      isExerciseDone,
      getDoneExerciseIds,
      getStreak,
      getLast14Days,
      getTotalWorkouts,
      getTotalExercisesDone,
      getDateKey,
      todayKey,
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
