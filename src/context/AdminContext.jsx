import { createContext, useContext, useState } from 'react';

const CUSTOM_EX_KEY   = 'wd_admin_custom_ex';
const DISABLED_EX_KEY = 'wd_admin_disabled_ex';

const AdminContext = createContext(null);

function ls(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

export function AdminProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [customExercises, setCustomExRaw] = useState(() => ls(CUSTOM_EX_KEY, []));
  const [disabledExercises, setDisabledRaw] = useState(() => ls(DISABLED_EX_KEY, []));

  function adminLogin()  { setIsAdminLoggedIn(true); }
  function adminLogout() { setIsAdminLoggedIn(false); }

  // ── Custom exercises ────────────────────────────────────────

  function saveCustomEx(list) {
    localStorage.setItem(CUSTOM_EX_KEY, JSON.stringify(list));
    setCustomExRaw(list);
  }

  function addCustomExercise(fields) {
    const id = 'cx_' + Date.now().toString(36);
    const ex = { ...fields, id, custom: true };
    saveCustomEx([...customExercises, ex]);
    return ex;
  }

  function updateCustomExercise(id, changes) {
    saveCustomEx(customExercises.map(e => e.id === id ? { ...e, ...changes } : e));
  }

  function deleteCustomExercise(id) {
    saveCustomEx(customExercises.filter(e => e.id !== id));
  }

  // ── Disabled toggle ─────────────────────────────────────────

  function toggleExerciseDisabled(id) {
    const next = disabledExercises.includes(id)
      ? disabledExercises.filter(x => x !== id)
      : [...disabledExercises, id];
    localStorage.setItem(DISABLED_EX_KEY, JSON.stringify(next));
    setDisabledRaw(next);
  }

  function isExerciseDisabled(id) { return disabledExercises.includes(id); }

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn, adminLogin, adminLogout,
      customExercises, disabledExercises,
      addCustomExercise, updateCustomExercise, deleteCustomExercise,
      toggleExerciseDisabled, isExerciseDisabled,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
}
