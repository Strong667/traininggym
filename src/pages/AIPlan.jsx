import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, RefreshCw, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import defaultPlan from '../data/workoutPlan';
import { getExerciseById } from '../data/exercises';

const GOALS = [
  { value: 'weightloss', label: '🔥 Похудение', desc: 'Жиросжигание и кардио' },
  { value: 'muscle',     label: '💪 Набор массы', desc: 'Силовые тренировки' },
  { value: 'endurance',  label: '❤️ Выносливость', desc: 'Кардио и функционал' },
];

const LEVELS = [
  { value: 'beginner',     label: 'Начинающий',   desc: '< 6 мес. опыта' },
  { value: 'intermediate', label: 'Средний',       desc: '6 мес. — 2 года' },
  { value: 'advanced',     label: 'Продвинутый',   desc: '> 2 лет' },
];

const EQUIPMENT = [
  { value: 'none',      label: 'Без инвентаря' },
  { value: 'dumbbells', label: 'Гантели' },
  { value: 'gym',       label: 'Тренажёрный зал' },
];

const DAYS_OPTIONS = [3, 4, 5, 6];

// ── AI provider config ────────────────────────────────────────

const PROVIDERS = [
  { value: 'claude',     label: 'Claude',     hint: 'Anthropic',  placeholder: 'sk-ant-...' },
  { value: 'openai',     label: 'OpenAI',     hint: 'GPT-4o',     placeholder: 'sk-...' },
  { value: 'deepseek',   label: 'DeepSeek',   hint: 'Chat',       placeholder: 'sk-...' },
  { value: 'openrouter', label: 'OpenRouter',  hint: 'любая модель', placeholder: 'sk-or-...' },
  { value: 'gemini',     label: 'Gemini',     hint: 'Google',     placeholder: 'AIza...' },
];

async function callClaude(key, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAICompat(key, prompt, baseUrl, model) {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(key, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callAI(key, prompt, provider) {
  switch (provider) {
    case 'claude':     return callClaude(key, prompt);
    case 'deepseek':   return callOpenAICompat(key, prompt, 'https://api.deepseek.com', 'deepseek-chat');
    case 'openrouter': return callOpenAICompat(key, prompt, 'https://openrouter.ai/api', 'openai/gpt-4o-mini');
    case 'gemini':     return callGemini(key, prompt);
    default:           return callOpenAICompat(key, prompt, 'https://api.openai.com', 'gpt-4o-mini');
  }
}

// ── component ─────────────────────────────────────────────────

export default function AIPlan() {
  const { customPlan, setCustomPlan } = useApp();
  const [goal, setGoal]           = useState('muscle');
  const [level, setLevel]         = useState('intermediate');
  const [equipment, setEquipment] = useState('none');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [apiKey, setApiKey]       = useState('');
  const [provider, setProvider]   = useState('claude');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const providerCfg = PROVIDERS.find(p => p.value === provider);

  async function generate() {
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const text = await callAI(apiKey.trim(), buildPrompt(goal, level, equipment, daysPerWeek), provider);
      const parsed = parsePlan(text);
      if (parsed) {
        setCustomPlan(parsed);
      } else {
        setError('Не удалось разобрать ответ AI. Попробуйте снова.');
      }
    } catch (e) {
      setError(e.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }

  function resetPlan() {
    setCustomPlan(null);
  }

  const activePlan = customPlan || defaultPlan;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={22} className="text-orange-500" /> AI-план тренировок
        </h1>
        {customPlan && (
          <button onClick={resetPlan} className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
            <RefreshCw size={12} /> Сброс
          </button>
        )}
      </div>

      {customPlan && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-400">AI-план активен. Кнопка «Сброс» вернёт стандартный план.</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
        <Section title="Цель">
          <div className="space-y-2">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setGoal(g.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${goal === g.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}
              >
                <span className="text-lg">{g.label.split(' ')[0]}</span>
                <div>
                  <p className={`text-sm font-medium ${goal === g.value ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>{g.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Уровень подготовки">
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`flex-1 text-center p-2.5 rounded-xl border text-xs font-medium transition-colors ${level === l.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                <div>{l.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Оборудование">
          <div className="flex gap-2">
            {EQUIPMENT.map(e => (
              <button key={e.value} onClick={() => setEquipment(e.value)}
                className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${equipment === e.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Дней в неделю">
          <div className="flex gap-2">
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDaysPerWeek(d)}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${daysPerWeek === d ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </Section>

        {/* Provider + API key */}
        {(showKeyInput || apiKey) && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">AI-провайдер</p>
              <div className="flex flex-wrap gap-1.5">
                {PROVIDERS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setProvider(p.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${provider === p.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}
                  >
                    {p.label}
                    <span className="ml-1 opacity-60">{p.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Key size={12} /> API ключ
              </label>
              <input
                type="password"
                placeholder={providerCfg?.placeholder || 'sk-...'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-orange-400"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Ключ хранится только в памяти страницы и не сохраняется.</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Генерирую план...</>
          ) : (
            <><Sparkles size={18} /> Сгенерировать план</>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-3">
          {customPlan ? 'AI-план (активен)' : 'Текущий план (стандартный)'}
        </h2>
        <div className="space-y-2">
          {activePlan.map(day => (
            <div key={day.dayIndex} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-medium text-gray-400 w-6">
                {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][day.dayIndex]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{day.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{day.exerciseIds.length} упражнений</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

function buildPrompt(goal, level, equipment, days) {
  const goalLabels  = { weightloss: 'похудение и жиросжигание', muscle: 'набор мышечной массы', endurance: 'развитие выносливости' };
  const levelLabels = { beginner: 'начинающий', intermediate: 'средний уровень', advanced: 'продвинутый' };
  const equipLabels = { none: 'без инвентаря (только вес тела)', dumbbells: 'с гантелями дома', gym: 'в тренажёрном зале' };

  return `Создай план тренировок на неделю для приложения WorkoutTracker.
Параметры пользователя:
- Цель: ${goalLabels[goal]}
- Уровень: ${levelLabels[level]}
- Оборудование: ${equipLabels[equipment]}
- Тренировочных дней в неделю: ${days}

Ответь ТОЛЬКО в виде JSON массива следующего формата (без пояснений):
[
  {
    "dayIndex": 0,
    "name": "Название тренировки",
    "focus": "chest",
    "exerciseIds": ["push-up", "squat", ...]
  },
  ...
]

Доступные exerciseIds: push-up, diamond-push-up, wide-push-up, incline-push-up, dumbbell-bench-press, dumbbell-fly, pull-up, negative-pull-up, dumbbell-row, superman, hyperextension, lat-pulldown, dumbbell-shoulder-press, lateral-raise, front-raise, shoulder-shrug, bicep-curl, hammer-curl, concentration-curl, tricep-dip, overhead-tricep, skull-crusher, crunch, reverse-crunch, plank, side-plank, leg-raise, russian-twist, bicycle-crunch, mountain-climber, squat, lunge, sumo-squat, glute-bridge, calf-raise, jump-squat, romanian-deadlift, jumping-jack, burpee, high-knee, jogging, jump-rope, child-pose, downward-dog, cat-cow, hip-flexor-stretch, hamstring-stretch, chest-stretch, foam-roll, walking, lying-twist

focus должен быть одним из: chest, back, legs, shoulders, biceps, triceps, abs, cardio, recovery
dayIndex: 0=Пн, 1=Вт, ..., 6=Вс. Остальные дни — восстановление.
Используй только указанные exerciseIds. 6-8 упражнений в тренировочный день, 4-5 в день восстановления.`;
}

function parsePlan(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length < 7) return null;
    return parsed.map(d => ({
      dayIndex: d.dayIndex,
      name: d.name || 'Тренировка',
      focus: d.focus || 'cardio',
      exerciseIds: Array.isArray(d.exerciseIds) ? d.exerciseIds.filter(id => getExerciseById(id)) : [],
    }));
  } catch {
    return null;
  }
}
