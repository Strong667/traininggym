import { useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { exercises as builtinExercises } from '../data/exercises';

export function useAllExercises() {
  const { customExercises, disabledExercises } = useAdmin();

  return useMemo(() => {
    const builtin = builtinExercises.filter(e => !disabledExercises.includes(e.id));
    return [...builtin, ...customExercises];
  }, [customExercises, disabledExercises]);
}

export function useExerciseById(id) {
  const all = useAllExercises();
  return useMemo(() => all.find(e => e.id === id) || null, [all, id]);
}
