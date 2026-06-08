// dayIndex: 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс
const defaultPlan = [
  {
    dayIndex: 0,
    name: 'Грудь и трицепс',
    focus: 'chest',
    exerciseIds: [
      'push-up',
      'wide-push-up',
      'incline-push-up',
      'dumbbell-bench-press',
      'dumbbell-fly',
      'diamond-push-up',
      'tricep-dip',
    ],
  },
  {
    dayIndex: 1,
    name: 'Спина и бицепс',
    focus: 'back',
    exerciseIds: [
      'pull-up',
      'dumbbell-row',
      'lat-pulldown',
      'superman',
      'hyperextension',
      'bicep-curl',
      'hammer-curl',
    ],
  },
  {
    dayIndex: 2,
    name: 'Кардио и пресс',
    focus: 'cardio',
    exerciseIds: [
      'jumping-jack',
      'burpee',
      'high-knee',
      'plank',
      'crunch',
      'reverse-crunch',
      'russian-twist',
      'mountain-climber',
    ],
  },
  {
    dayIndex: 3,
    name: 'Ноги и ягодицы',
    focus: 'legs',
    exerciseIds: [
      'squat',
      'sumo-squat',
      'lunge',
      'jump-squat',
      'glute-bridge',
      'calf-raise',
      'romanian-deadlift',
    ],
  },
  {
    dayIndex: 4,
    name: 'Плечи и всё тело',
    focus: 'shoulders',
    exerciseIds: [
      'dumbbell-shoulder-press',
      'lateral-raise',
      'front-raise',
      'shoulder-shrug',
      'burpee',
      'jumping-jack',
      'mountain-climber',
    ],
  },
  {
    dayIndex: 5,
    name: 'Кардио и растяжка',
    focus: 'cardio',
    exerciseIds: [
      'jogging',
      'jump-rope',
      'chest-stretch',
      'hamstring-stretch',
      'hip-flexor-stretch',
      'downward-dog',
    ],
  },
  {
    dayIndex: 6,
    name: 'Восстановление',
    focus: 'recovery',
    exerciseIds: [
      'walking',
      'foam-roll',
      'child-pose',
      'cat-cow',
      'lying-twist',
    ],
  },
];

export default defaultPlan;

// Convert JS getDay() (0=Sun) to our system (0=Mon)
export function getTodayDayIndex() {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1; // 0=Mon, ..., 6=Sun
}

export const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
export const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
