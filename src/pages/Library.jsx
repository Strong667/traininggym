import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MUSCLE_GROUPS, EQUIPMENT_LABELS } from '../data/exercises';
import ExerciseCard from '../components/ExerciseCard';
import { useAllExercises } from '../hooks/useAllExercises';

const EQUIPMENT_OPTIONS = [
  { value: 'all', label: 'Всё' },
  { value: 'none', label: 'Без инвентаря' },
  { value: 'dumbbells', label: 'Гантели' },
  { value: 'gym', label: 'Зал' },
];

export default function Library() {
  const [search, setSearch] = useState('');
  const [equipFilter, setEquipFilter] = useState('all');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const allExercises = useAllExercises();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allExercises.filter(ex => {
      const matchSearch = !search
        || ex.name.toLowerCase().includes(q)
        || (ex.nameEn && ex.nameEn.toLowerCase().includes(q));
      const matchEquip = equipFilter === 'all' || ex.equipment === equipFilter;
      const matchMuscle = muscleFilter === 'all' || ex.muscle === muscleFilter;
      return matchSearch && matchEquip && matchMuscle;
    });
  }, [allExercises, search, equipFilter, muscleFilter]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(ex => {
      if (!groups[ex.muscle]) groups[ex.muscle] = [];
      groups[ex.muscle].push(ex);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-screen pb-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Библиотека упражнений</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск упражнений..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Оборудование</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setEquipFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${equipFilter === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Группа мышц</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMuscleFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${muscleFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                Все
              </button>
              {Object.entries(MUSCLE_GROUPS).map(([key, g]) => (
                <button
                  key={key}
                  onClick={() => setMuscleFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${muscleFilter === key ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-lg">Ничего не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([muscle, exList]) => (
            <div key={muscle}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{MUSCLE_GROUPS[muscle]?.icon}</span>
                <h2 className="font-semibold text-gray-700 dark:text-gray-300">{MUSCLE_GROUPS[muscle]?.label}</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">({exList.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {exList.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
