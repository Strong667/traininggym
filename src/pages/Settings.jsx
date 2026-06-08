import { useState } from 'react';
import { Sun, Moon, Trash2, Bell, Key, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { theme, setTheme, settings, setSettings, resetAllData } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function saveKey(value) {
    updateSetting('workoutxKey', value);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function handleReset() {
    resetAllData();
    setShowConfirm(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Настройки</h1>

      <SettingsGroup title="Внешний вид">
        <SettingsRow
          icon={theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-yellow-500" />}
          label="Тема"
        >
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
            <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} label="Светлая" />
            <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} label="Тёмная" />
          </div>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Уведомления">
        <SettingsRow icon={<Bell size={18} className="text-orange-400" />} label="Время напоминания">
          <input
            type="time"
            value={settings.notificationTime || '08:00'}
            onChange={e => updateSetting('notificationTime', e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </SettingsRow>
        <p className="text-xs text-gray-400 dark:text-gray-500 px-4 pb-3">Push-уведомления доступны в PWA или мобильном приложении.</p>
      </SettingsGroup>

      {/* GIF API key section */}
      <SettingsGroup title="GIF-анимации упражнений">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <Key size={16} className="text-green-500 mt-0.5 shrink-0" />
            <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <p className="font-semibold">Без ключа — уже есть GIF!</p>
              <p>Автоматически загружаются GIF из открытой базы ExerciseDB (1500 упражнений, без регистрации).</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
            <Key size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
              <p className="font-semibold">С ключом WorkoutX — приоритет над ExerciseDB</p>
              <p>Бесплатно, 500 запросов/месяц, карта не нужна.</p>
              <a
                href="https://workoutxapp.com/dashboard.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400 underline underline-offset-2"
              >
                Получить бесплатный ключ <ExternalLink size={11} />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              API ключ WorkoutX
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="wx_..."
                  defaultValue={settings.workoutxKey || ''}
                  onBlur={e => saveKey(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {keySaved && (
                <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                  <CheckCircle2 size={16} />
                  Сохранено
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Ключ хранится только в этом браузере и нигде не передаётся.
            </p>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Данные">
        <div className="px-4 py-3">
          {showConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Удалить все данные тренировок?</p>
              <p className="text-xs text-red-500">Это действие необратимо. Вся история будет удалена.</p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
                  Да, удалить
                </button>
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={18} />
              <span className="text-sm font-medium">Сбросить все данные</span>
            </button>
          )}
        </div>
      </SettingsGroup>

      <SettingsGroup title="О приложении">
        <div className="px-4 py-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <p>WorkoutTracker v1.0</p>
          <p>Данные хранятся локально в браузере.</p>
          <p className="text-xs">По ТЗ Июнь 2026</p>
        </div>
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">{title}</p>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ThemeButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
        active ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {label}
    </button>
  );
}
