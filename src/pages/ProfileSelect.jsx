import { useState } from 'react';
import { Dumbbell, Plus, ArrowLeft, Delete, Check, Lock } from 'lucide-react';
import { useAuth, PROFILE_COLORS, PROFILE_EMOJIS } from '../context/AuthContext';

// ── Avatar helper ─────────────────────────────────────────────
export function ProfileAvatar({ profile, size = 48, textSize = 'text-xl' }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${textSize}`}
      style={{ width: size, height: size, backgroundColor: profile.color }}
    >
      {profile.emoji}
    </div>
  );
}

// ── PIN dots indicator ────────────────────────────────────────
function PinDots({ length, error }) {
  return (
    <div className="flex gap-4 justify-center">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            error
              ? 'border-red-500 bg-red-500'
              : i < length
              ? 'border-white bg-white'
              : 'border-gray-500 bg-transparent'
          }`}
        />
      ))}
    </div>
  );
}

// ── Numeric keypad ────────────────────────────────────────────
function Keypad({ onDigit, onDelete }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
      {keys.map((k, i) => {
        if (k === '') return <div key={i} />;
        if (k === 'del') return (
          <button
            key={i}
            onClick={onDelete}
            className="h-16 flex items-center justify-center rounded-2xl bg-gray-800 text-white active:scale-95 transition-transform"
          >
            <Delete size={22} />
          </button>
        );
        return (
          <button
            key={k}
            onClick={() => onDigit(k)}
            className="h-16 text-2xl font-semibold text-white bg-gray-800 hover:bg-gray-700 active:scale-95 rounded-2xl transition-all"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

// ── PIN entry screen ──────────────────────────────────────────
function PinScreen({ profile, onBack }) {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function handleDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        const ok = login(profile.id, next);
        if (!ok) { setError(true); setPin(''); }
      }, 80);
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-6 pt-12">
      <button onClick={onBack} className="self-start text-gray-400 hover:text-white mb-8 flex items-center gap-1">
        <ArrowLeft size={20} /> Назад
      </button>

      <ProfileAvatar profile={profile} size={72} textSize="text-3xl" />
      <p className="text-white text-xl font-semibold mt-4 mb-2">{profile.name}</p>
      <p className="text-gray-400 text-sm mb-10">Введите PIN-код</p>

      <PinDots length={pin.length} error={error} />
      {error && <p className="text-red-400 text-sm mt-3">Неверный PIN</p>}

      <div className="mt-8">
        <Keypad onDigit={handleDigit} onDelete={handleDelete} />
      </div>
    </div>
  );
}

// ── Create profile screen ─────────────────────────────────────
function CreateScreen({ onBack, onCreated }) {
  const { createProfile, login } = useAuth();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [emoji, setEmoji] = useState(PROFILE_EMOJIS[0]);
  const [pin, setPin] = useState('');
  const [pinMode, setPinMode] = useState(false); // enter PIN with keypad
  const [step, setStep] = useState('info'); // 'info' | 'pin'

  function handleCreate() {
    if (!name.trim()) return;
    const profile = createProfile({ name, color, emoji, pin: pin.length === 4 ? pin : '' });
    login(profile.id);
    onCreated?.();
  }

  function handlePinDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
  }

  if (step === 'pin') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center px-6 pt-12">
        <button onClick={() => { setStep('info'); setPin(''); }} className="self-start text-gray-400 hover:text-white mb-8 flex items-center gap-1">
          <ArrowLeft size={20} /> Назад
        </button>

        <div
          className="w-18 h-18 rounded-full flex items-center justify-center text-3xl mb-4"
          style={{ width: 72, height: 72, backgroundColor: color }}
        >
          {emoji}
        </div>
        <p className="text-white text-xl font-semibold mb-1">{name || 'Профиль'}</p>
        <p className="text-gray-400 text-sm mb-10">Придумайте PIN-код (или пропустите)</p>

        <PinDots length={pin.length} error={false} />

        <div className="mt-8">
          <Keypad onDigit={handlePinDigit} onDelete={() => setPin(p => p.slice(0, -1))} />
        </div>

        <div className="mt-8 w-full max-w-[260px] space-y-3">
          <button
            onClick={handleCreate}
            disabled={pin.length > 0 && pin.length < 4}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-2xl transition-colors"
          >
            {pin.length === 4 ? 'Создать с PIN' : 'Создать без PIN'}
          </button>
        </div>
      </div>
    );
  }

  // Step: info
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col px-6 pt-12 pb-8">
      <button onClick={onBack} className="self-start text-gray-400 hover:text-white mb-8 flex items-center gap-1">
        <ArrowLeft size={20} /> Назад
      </button>

      <h2 className="text-white text-2xl font-bold mb-8">Новый профиль</h2>

      {/* Avatar preview */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: color }}>
          {emoji}
        </div>
      </div>

      {/* Name */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Имя</label>
        <input
          type="text"
          placeholder="Например: Алибек"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 text-base focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Emoji */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Аватар</label>
        <div className="flex gap-2 flex-wrap">
          {PROFILE_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'ring-2 ring-orange-500 bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-8">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Цвет</label>
        <div className="flex gap-2.5">
          {PROFILE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full transition-transform active:scale-90"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => name.trim() ? setStep('pin') : null}
        disabled={!name.trim()}
        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-2xl transition-colors"
      >
        Далее
      </button>
    </div>
  );
}

// ── Main profile select screen ────────────────────────────────
export default function ProfileSelect() {
  const { profiles, login } = useAuth();
  const [mode, setMode] = useState('list'); // 'list' | 'pin' | 'create'
  const [selectedProfile, setSelectedProfile] = useState(null);

  function handleProfileTap(profile) {
    if (profile.pin) {
      setSelectedProfile(profile);
      setMode('pin');
    } else {
      login(profile.id);
    }
  }

  if (mode === 'pin') {
    return <PinScreen profile={selectedProfile} onBack={() => setMode('list')} />;
  }

  if (mode === 'create') {
    return <CreateScreen onBack={() => setMode('list')} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-3">
        <Dumbbell size={30} className="text-orange-500" />
        <span className="text-2xl font-bold text-white tracking-tight">WorkoutTracker</span>
      </div>
      <p className="text-gray-500 text-sm mb-10">
        {profiles.length === 0 ? 'Создайте первый профиль' : 'Выберите профиль'}
      </p>

      <div className="w-full max-w-sm space-y-3">
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => handleProfileTap(profile)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800 hover:bg-gray-750 active:scale-[0.98] transition-all text-left"
            style={{ '--tw-bg-opacity': 1 }}
          >
            <ProfileAvatar profile={profile} size={52} textSize="text-2xl" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base">{profile.name}</p>
              {profile.pin
                ? <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Lock size={10} /> Защищён PIN-кодом</p>
                : <p className="text-gray-500 text-xs mt-0.5">Нажмите для входа</p>
              }
            </div>
            <div className="text-gray-600 text-lg">›</div>
          </button>
        ))}

        <button
          onClick={() => setMode('create')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-700 hover:border-orange-500 hover:text-orange-400 active:scale-[0.98] transition-all text-gray-500"
        >
          <div className="w-13 h-13 rounded-full flex items-center justify-center bg-gray-800" style={{ width: 52, height: 52 }}>
            <Plus size={22} />
          </div>
          <span className="font-semibold">Добавить профиль</span>
        </button>
      </div>
    </div>
  );
}
