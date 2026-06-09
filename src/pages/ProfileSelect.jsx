import { useState, useRef } from 'react';
import { Dumbbell, Plus, ArrowLeft, Delete, Lock, ShieldCheck, UserX } from 'lucide-react';
import { useAuth, PROFILE_COLORS, PROFILE_EMOJIS } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

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
    <div className="flex gap-5 justify-center">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
            error
              ? 'border-red-400 bg-red-400 scale-110'
              : i < length
              ? 'border-white bg-white scale-110'
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
    <div className="grid grid-cols-3 gap-3 w-full px-2">
      {keys.map((k, i) => {
        if (k === '') return <div key={i} />;
        if (k === 'del') return (
          <button
            key={i}
            onClick={onDelete}
            className="aspect-square flex items-center justify-center rounded-full text-white active:bg-gray-700 active:scale-90 transition-all select-none"
          >
            <Delete size={26} />
          </button>
        );
        return (
          <button
            key={k}
            onClick={() => onDigit(k)}
            className="aspect-square flex flex-col items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 active:scale-90 transition-all select-none"
          >
            <span className="text-3xl font-light text-white leading-none">{k}</span>
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
        const result = login(profile.id, next);
        if (result !== 'ok') { setError(true); setPin(''); }
      }, 80);
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Back */}
      <div className="px-5 pt-14 pb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={18} /> Назад
        </button>
      </div>

      {/* Profile info — centered in top half */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-4">
        <ProfileAvatar profile={profile} size={88} textSize="text-4xl" />
        <div className="text-center">
          <p className="text-white text-2xl font-semibold">{profile.name}</p>
          <p className="text-gray-500 text-sm mt-1">Введите PIN-код</p>
        </div>
        <div className="mt-4">
          <PinDots length={pin.length} error={error} />
          <div className="h-7 flex items-center justify-center mt-3">
            {error && <p className="text-red-400 text-sm animate-pulse">Неверный PIN-код</p>}
          </div>
        </div>
      </div>

      {/* Keypad — anchored to bottom */}
      <div className="px-8 pb-14 max-w-sm w-full mx-auto">
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
  const [step, setStep] = useState('info'); // 'info' | 'pin'
  const creatingRef = useRef(false); // guard against double-tap creating duplicates

  function handleCreate() {
    if (!name.trim() || creatingRef.current) return;
    creatingRef.current = true;
    const newPin = pin.length === 4 ? pin : '';
    const profile = createProfile({ name, color, emoji, pin: newPin });
    if (newPin) {
      // Профиль защищён PIN — нельзя войти без ввода кода, уходим на страницу входа
      onCreated?.();
    } else {
      // Без PIN — сразу логиним
      login(profile.id);
    }
  }

  function handlePinDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
  }

  if (step === 'pin') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="px-5 pt-14 pb-2">
          <button onClick={() => { setStep('info'); setPin(''); }} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={18} /> Назад
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-4">
          <div className="rounded-full flex items-center justify-center text-4xl" style={{ width: 88, height: 88, backgroundColor: color }}>
            {emoji}
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-semibold">{name || 'Профиль'}</p>
            <p className="text-gray-500 text-sm mt-1">Придумайте PIN-код (необязательно)</p>
          </div>
          <div className="mt-4">
            <PinDots length={pin.length} error={false} />
            <div className="h-7" />
          </div>
        </div>

        <div className="px-8 pb-6 max-w-sm w-full mx-auto space-y-4">
          <Keypad onDigit={handlePinDigit} onDelete={() => setPin(p => p.slice(0, -1))} />
          <button
            onClick={handleCreate}
            disabled={pin.length > 0 && pin.length < 4}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-2xl transition-colors text-base"
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

// ── Admin access screen ───────────────────────────────────────
function AdminAccess({ onBack }) {
  const { adminPinSet, setupAdminPin, verifyAdminPin } = useAuth();
  const { adminLogin } = useAdmin();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState(adminPinSet ? 'enter' : 'setup'); // 'setup' | 'enter'
  const [error, setError] = useState('');

  function handleDigit(d) {
    if (step === 'setup') {
      if (pin.length < 4) {
        const next = pin + d;
        setPin(next);
        if (next.length === 4) setStep('confirm');
      }
    } else if (step === 'confirm') {
      if (confirm.length < 4) {
        const next = confirm + d;
        setConfirm(next);
        if (next.length === 4) {
          if (next === pin) { setupAdminPin(pin); adminLogin(); }
          else { setError('PIN не совпадает. Попробуйте снова.'); setPin(''); setConfirm(''); setStep('setup'); }
        }
      }
    } else {
      if (pin.length < 4) {
        const next = pin + d;
        setPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (verifyAdminPin(next)) { adminLogin(); }
            else { setError('Неверный PIN'); setPin(''); }
          }, 80);
        }
      }
    }
  }

  const title = step === 'setup' ? 'Создайте PIN администратора'
              : step === 'confirm' ? 'Повторите PIN'
              : 'PIN администратора';
  const currentPin = step === 'confirm' ? confirm : pin;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="px-5 pt-14 pb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={18} /> Назад
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-4">
        <ShieldCheck size={64} className="text-orange-500" />
        <div className="text-center">
          <p className="text-white text-2xl font-semibold">{title}</p>
          {step === 'setup' && <p className="text-gray-500 text-sm mt-1">Этот PIN защищает панель управления</p>}
        </div>
        <div className="mt-4">
          <PinDots length={currentPin.length} error={!!error} />
          <div className="h-7 flex items-center justify-center mt-3">
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      </div>

      <div className="px-8 pb-14 max-w-sm w-full mx-auto">
        <Keypad
          onDigit={handleDigit}
          onDelete={() => {
            setError('');
            if (step === 'confirm') setConfirm(p => p.slice(0, -1));
            else setPin(p => p.slice(0, -1));
          }}
        />
      </div>
    </div>
  );
}

// ── Main profile select screen ────────────────────────────────
export default function ProfileSelect() {
  const { profiles, login } = useAuth();
  const [mode, setMode] = useState('list'); // 'list' | 'pin' | 'create' | 'admin'
  const [selectedProfile, setSelectedProfile] = useState(null);

  function handleProfileTap(profile) {
    if (profile.active === false) return; // blocked
    if (profile.pin) {
      setSelectedProfile(profile);
      setMode('pin');
    } else {
      login(profile.id);
    }
  }

  if (mode === 'pin')   return <PinScreen profile={selectedProfile} onBack={() => setMode('list')} />;
  if (mode === 'create') return <CreateScreen onBack={() => setMode('list')} onCreated={() => setMode('list')} />;
  if (mode === 'admin')  return <AdminAccess onBack={() => setMode('list')} />;

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
        {profiles.map(profile => {
          const blocked = profile.active === false;
          return (
            <button
              key={profile.id}
              onClick={() => handleProfileTap(profile)}
              disabled={blocked}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${blocked ? 'bg-gray-900 opacity-50 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 active:scale-[0.98]'}`}
            >
              <div className="relative">
                <ProfileAvatar profile={profile} size={52} textSize="text-2xl" />
                {blocked && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <UserX size={18} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base">{profile.name}</p>
                {blocked
                  ? <p className="text-red-400 text-xs mt-0.5">Заблокирован администратором</p>
                  : profile.pin
                  ? <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Lock size={10} /> Защищён PIN-кодом</p>
                  : <p className="text-gray-500 text-xs mt-0.5">Нажмите для входа</p>
                }
              </div>
              {!blocked && <div className="text-gray-600 text-lg">›</div>}
            </button>
          );
        })}

        <button
          onClick={() => setMode('create')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-700 hover:border-orange-500 hover:text-orange-400 active:scale-[0.98] transition-all text-gray-500"
        >
          <div className="rounded-full flex items-center justify-center bg-gray-800" style={{ width: 52, height: 52 }}>
            <Plus size={22} />
          </div>
          <span className="font-semibold">Добавить профиль</span>
        </button>
      </div>

      {/* Admin access */}
      <button
        onClick={() => setMode('admin')}
        className="mt-8 flex items-center gap-1.5 text-gray-600 hover:text-gray-400 transition-colors text-xs"
      >
        <ShieldCheck size={13} /> Вход для администратора
      </button>
    </div>
  );
}
