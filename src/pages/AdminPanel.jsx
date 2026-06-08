import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, LogOut, Users, Dumbbell, ChevronDown, ChevronUp,
  Pencil, Trash2, UserCheck, UserX, Lock, Plus, Check, X, Save,
  Eye, EyeOff, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';
import { useAuth, PROFILE_COLORS, PROFILE_EMOJIS } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { ProfileAvatar } from './ProfileSelect';
import { exercises as builtinExercises, MUSCLE_GROUPS, EQUIPMENT_LABELS } from '../data/exercises';

// ── AscendAPI bodyPart → Russian ──────────────────────────────
const BODY_RU = {
  'chest':       'Грудь',
  'back':        'Спина',
  'shoulders':   'Плечи',
  'upper arms':  'Руки',
  'upper legs':  'Ноги',
  'lower legs':  'Голень',
  'waist':       'Пресс',
  'cardio':      'Кардио',
  'neck':        'Шея',
  'lower arms':  'Предплечья',
};

// Set of all built-in nameEn values (normalised) for deduplication
const BUILTIN_NAMES = new Set(builtinExercises.map(e => e.nameEn.toLowerCase().trim()));

// ── Exercise name search dropdown ─────────────────────────────
function ExerciseNamePicker({ value, onChange }) {
  const [query, setQuery]     = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`https://oss.exercisedb.dev/api/v1/exercises?name=${encodeURIComponent(query)}&limit=25`);
        const json = await res.json();
        const all  = json.data || [];
        // Filter out exercises already in built-in list
        const filtered = all.filter(e => !BUILTIN_NAMES.has(e.name.toLowerCase().trim()));
        setResults(filtered);
        setOpen(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  function select(ex) {
    const name = ex.name;
    setQuery(name);
    onChange(name);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(''); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Начните вводить название..."
          className="w-full px-3 py-2 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {results.map(ex => {
            const bodyRu = BODY_RU[ex.bodyParts?.[0]] || ex.bodyParts?.[0] || '—';
            return (
              <button
                key={ex.exerciseId}
                onClick={() => select(ex)}
                className="w-full text-left px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
              >
                <span className="text-sm text-gray-800 dark:text-gray-100 font-medium">{ex.name}</span>
                <span className="text-xs text-gray-400 ml-2">— {bodyRu}</span>
              </button>
            );
          })}
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl px-3 py-3 text-xs text-gray-400 text-center">
          Ничего не найдено (или все упражнения уже добавлены)
        </div>
      )}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

// ── Section heading ───────────────────────────────────────────
function SectionHead({ children }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mt-4 mb-1 first:mt-0">
      {children}
    </p>
  );
}

// ════════════════════════════════════════════════════════════
// PROFILES TAB
// ════════════════════════════════════════════════════════════

function ProfileRow({ profile }) {
  const { updateProfile, deleteProfile, deactivateProfile, activateProfile } = useAuth();
  const [open, setOpen]       = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPin, setEditPin]   = useState('');
  const [showPin, setShowPin]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editColor, setEditColor] = useState(profile.color);
  const [editEmoji, setEditEmoji] = useState(profile.emoji);

  function save() {
    const changes = {
      name: editName.trim() || profile.name,
      color: editColor,
      emoji: editEmoji,
    };
    if (editPin.length === 4) changes.pin = editPin;
    if (editPin === '0000') changes.pin = ''; // clear pin sentinel
    updateProfile(profile.id, changes);
    setEditPin('');
    setOpen(false);
  }

  const isActive = profile.active !== false;

  return (
    <div className={`rounded-2xl border transition-all ${isActive ? 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10'}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          <ProfileAvatar profile={{ ...profile, color: editColor, emoji: editEmoji }} size={44} textSize="text-xl" />
          {!isActive && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <UserX size={14} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 dark:text-white truncate">{profile.name}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className={`text-xs font-medium ${isActive ? 'text-green-500' : 'text-red-400'}`}>
              {isActive ? '● Активен' : '● Заблокирован'}
            </span>
            {profile.pin && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Lock size={10} /> PIN</span>}
          </div>
        </div>

        <button onClick={() => setOpen(v => !v)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded edit panel */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => isActive ? deactivateProfile(profile.id) : activateProfile(profile.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
              }`}
            >
              {isActive ? <><UserX size={13} /> Заблокировать</> : <><UserCheck size={13} /> Активировать</>}
            </button>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors">
                <Trash2 size={13} /> Удалить
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle size={13} className="text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400">Удалить?</span>
                <button onClick={() => deleteProfile(profile.id)} className="text-xs font-bold text-red-600 hover:text-red-800">Да</button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-700">Нет</button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Имя</label>
            <input
              type="text" value={editName} maxLength={20}
              onChange={e => setEditName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Emoji */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Аватар</label>
            <div className="flex gap-1.5 flex-wrap">
              {PROFILE_EMOJIS.map(e => (
                <button key={e} onClick={() => setEditEmoji(e)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${editEmoji === e ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                >{e}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Цвет</label>
            <div className="flex gap-2">
              {PROFILE_COLORS.map(c => (
                <button key={c} onClick={() => setEditColor(c)}
                  className="w-8 h-8 rounded-full transition-transform active:scale-90"
                  style={{ backgroundColor: c, outline: editColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}
                />
              ))}
            </div>
          </div>

          {/* PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Lock size={11} /> PIN-код
              {profile.pin && <span className="text-gray-300">· текущий установлен</span>}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                placeholder={profile.pin ? 'Новый PIN (4 цифры) или 0000 чтобы убрать' : 'Установить PIN (4 цифры)'}
                value={editPin}
                onChange={e => setEditPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pr-10 pl-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
              <button type="button" onClick={() => setShowPin(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {editPin === '0000' && <p className="text-xs text-amber-500">PIN будет удалён</p>}
          </div>

          {/* Save */}
          <button onClick={save}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <Save size={15} /> Сохранить изменения
          </button>
        </div>
      )}
    </div>
  );
}

function ProfilesTab() {
  const { profiles } = useAuth();

  return (
    <div className="space-y-2 pb-4">
      {profiles.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Нет профилей</p>
        </div>
      ) : (
        profiles.map(p => <ProfileRow key={p.id} profile={p} />)
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// EXERCISES TAB
// ════════════════════════════════════════════════════════════

const BLANK_EX = {
  name: '', nameEn: '', muscle: 'chest', equipment: 'none',
  sets: 3, reps: 10, repsType: 'count', description: '', tips: [],
};

function ExerciseForm({ initial = BLANK_EX, onSave, onCancel }) {
  const [form, setForm] = useState({ ...BLANK_EX, ...initial });
  const [tipsText, setTipsText] = useState((initial.tips || []).join('\n'));

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...form, tips: tipsText.split('\n').map(t => t.trim()).filter(Boolean) });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Название (рус.)</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Отжимания" maxLength={60}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Упражнение из базы — для GIF
          </label>
          <ExerciseNamePicker value={form.nameEn} onChange={v => set('nameEn', v)} />
          {form.nameEn && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <Check size={11} /> Выбрано: <span className="font-medium">{form.nameEn}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Мышца</label>
          <select value={form.muscle} onChange={e => set('muscle', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400">
            {Object.entries(MUSCLE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Инвентарь</label>
          <select value={form.equipment} onChange={e => set('equipment', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400">
            {Object.entries(EQUIPMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Подходы</label>
          <input type="number" min={1} max={20} value={form.sets} onChange={e => set('sets', +e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Повторения</label>
          <input type="number" min={1} max={300} value={form.reps} onChange={e => set('reps', +e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Тип</label>
          <div className="flex gap-2">
            {[['count','Повторения'],['time','Секунды'],['minutes','Минуты']].map(([v, l]) => (
              <button key={v} onClick={() => set('repsType', v)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors border ${form.repsType === v ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Описание техники</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3} placeholder="Как выполнять упражнение..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none" />
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Советы (каждый с новой строки)</label>
          <textarea value={tipsText} onChange={e => setTipsText(e.target.value)}
            rows={3} placeholder="Держите спину прямо&#10;Дышите равномерно"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold">
          Отмена
        </button>
        <button onClick={handleSave} disabled={!form.name.trim()}
          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
          <Save size={14} /> Сохранить
        </button>
      </div>
    </div>
  );
}

function BuiltinExerciseRow({ exercise }) {
  const { isExerciseDisabled, toggleExerciseDisabled } = useAdmin();
  const disabled = isExerciseDisabled(exercise.id);
  const group = MUSCLE_GROUPS[exercise.muscle];

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-base">{group?.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${disabled ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
          {exercise.name}
        </p>
        <p className="text-xs text-gray-400">{EQUIPMENT_LABELS[exercise.equipment]}</p>
      </div>
      <Toggle on={!disabled} onChange={() => toggleExerciseDisabled(exercise.id)} />
    </div>
  );
}

function CustomExerciseRow({ exercise }) {
  const { updateCustomExercise, deleteCustomExercise } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const group = MUSCLE_GROUPS[exercise.muscle];

  if (editing) {
    return (
      <div className="mb-2">
        <ExerciseForm
          initial={exercise}
          onSave={data => { updateCustomExercise(exercise.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
      <span className="text-base">{group?.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{exercise.name}</p>
        <p className="text-xs text-orange-400">Пользовательское · {EQUIPMENT_LABELS[exercise.equipment]}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors">
          <Pencil size={14} />
        </button>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => deleteCustomExercise(exercise.id)} className="p-1 text-red-500"><Check size={14} /></button>
            <button onClick={() => setConfirmDelete(false)} className="p-1 text-gray-400"><X size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExercisesTab() {
  const { customExercises, addCustomExercise } = useAdmin();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');

  const groups = Object.entries(MUSCLE_GROUPS);
  const builtinByMuscle = groups.map(([key, g]) => ({
    key, g,
    items: builtinExercises.filter(e => e.muscle === key),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-3 pb-4">
      {/* Custom exercises section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <SectionHead>Пользовательские упражнения</SectionHead>
        </div>
        <div className="space-y-1.5">
          {customExercises.map(ex => <CustomExerciseRow key={ex.id} exercise={ex} />)}
        </div>

        {adding ? (
          <ExerciseForm
            onSave={data => { addCustomExercise(data); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors text-sm font-medium">
            <Plus size={16} /> Добавить упражнение
          </button>
        )}
      </div>

      {/* Built-in exercises grouped by muscle */}
      <SectionHead>Встроенные упражнения</SectionHead>
      <p className="text-xs text-gray-400 px-1">Выключенные упражнения скрыты во всех профилях.</p>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
        {builtinByMuscle.map(({ key, g, items }) => (
          <div key={key}>
            <div className="px-3 py-2 flex items-center gap-2">
              <span>{g.icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${g.color}`}>{g.label}</span>
            </div>
            <div className="px-1 pb-1 space-y-0.5">
              {items.map(ex => <BuiltinExerciseRow key={ex.id} exercise={ex} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ADMIN SETTINGS TAB
// ════════════════════════════════════════════════════════════

function AdminSettingsTab() {
  const { changeAdminPin } = useAuth();
  const { adminLogout } = useAdmin();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [msg, setMsg] = useState('');

  function handleChange() {
    if (newPin.length !== 4) { setMsg('Новый PIN должен быть 4 цифры'); return; }
    if (newPin !== newPin2) { setMsg('PIN-коды не совпадают'); return; }
    const ok = changeAdminPin(oldPin, newPin);
    if (ok) { setMsg('PIN изменён'); setOldPin(''); setNewPin(''); setNewPin2(''); }
    else setMsg('Неверный текущий PIN');
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Сменить PIN администратора</p>

        {[['Текущий PIN', oldPin, setOldPin], ['Новый PIN', newPin, setNewPin], ['Повторите PIN', newPin2, setNewPin2]].map(([label, val, set]) => (
          <div key={label} className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
            <input
              type="password" inputMode="numeric" maxLength={4}
              value={val} onChange={e => set(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        ))}

        {msg && <p className={`text-xs ${msg.includes('изменён') ? 'text-green-500' : 'text-red-400'}`}>{msg}</p>}

        <button onClick={handleChange}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm">
          Сохранить
        </button>
      </div>

      <button onClick={adminLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition-colors">
        <LogOut size={16} /> Выйти из панели администратора
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ════════════════════════════════════════════════════════════

const TABS = [
  { id: 'profiles',  label: 'Профили',     Icon: Users },
  { id: 'exercises', label: 'Упражнения',  Icon: Dumbbell },
  { id: 'settings',  label: 'Настройки',   Icon: ShieldCheck },
];

export default function AdminPanel() {
  const { adminLogout } = useAdmin();
  const [tab, setTab] = useState('profiles');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-orange-500" />
            <span className="font-bold text-gray-900 dark:text-white">Администратор</span>
          </div>
          <button onClick={adminLogout} className="text-gray-400 hover:text-red-400 transition-colors p-1">
            <LogOut size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto flex gap-1 mt-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === id
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {tab === 'profiles'  && <ProfilesTab />}
        {tab === 'exercises' && <ExercisesTab />}
        {tab === 'settings'  && <AdminSettingsTab />}
      </div>
    </div>
  );
}
