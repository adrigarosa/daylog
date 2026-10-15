import { TODAY, addDays } from '@utils/dateUtils';
import dayjs from 'dayjs';
import type { EntryWithCats } from '@stores/journalStore';
import type { CategoryRow } from '@db/schema';
import type { HabitConfig } from '@t/index';
import type { PeriodStats, PeriodKey } from '@services/statsService';

const today = TODAY();

export const MOCK_CATEGORIES: CategoryRow[] = [
  { id: 'cat_laboral',   name: 'Laboral',    color: '#2196F3', icon: '💼', isSystem: true, sortOrder: 1 },
  { id: 'cat_deportivo', name: 'Deportivo',  color: '#009688', icon: '🏃', isSystem: true, sortOrder: 7 },
  { id: 'cat_personal',  name: 'Personal',   color: '#9C27B0', icon: '🧘', isSystem: true, sortOrder: 2 },
  { id: 'cat_salud',     name: 'Salud',      color: '#F44336', icon: '❤️', isSystem: true, sortOrder: 8 },
  { id: 'cat_hobbie',    name: 'Hobbie',     color: '#FF9800', icon: '🎨', isSystem: true, sortOrder: 3 },
  { id: 'cat_familiar',  name: 'Familiar',   color: '#E91E63', icon: '👨‍👩‍👧‍👦', isSystem: true, sortOrder: 0 },
  { id: 'cat_meta',      name: 'Meta',       color: '#3F51B5', icon: '🎯', isSystem: true, sortOrder: 10 },
  { id: 'cat_amistad',   name: 'Amistad',    color: '#00BCD4', icon: '🤝', isSystem: true, sortOrder: 11 },
];

export const MOCK_HABIT_CONFIGS: HabitConfig[] = [
  {
    id: 'habit_gym',
    name: 'Gym',
    description: 'Entrenamiento de fuerza',
    categoryIds: ['cat_deportivo', 'cat_salud'],
    keywords: ['gym', 'entreno', 'ejercicio'],
    color: '#009688',
    isActive: true,
    createdAt: addDays(today, -30),
  },
  {
    id: 'habit_leer',
    name: 'Leer 30 min',
    description: 'Lectura diaria mínima',
    categoryIds: ['cat_hobbie', 'cat_personal'],
    keywords: ['leer', 'libro', 'leyendo'],
    color: '#FF9800',
    isActive: true,
    createdAt: addDays(today, -30),
  },
  {
    id: 'habit_agua',
    name: '2L de agua',
    description: 'Hidratación diaria',
    categoryIds: ['cat_salud'],
    keywords: ['agua', 'hidratacion'],
    color: '#03A9F4',
    isActive: true,
    createdAt: addDays(today, -15),
  },
];

// Simulated done-dates for streak calculation in web preview
export const MOCK_HABIT_DONE_DATES: Record<string, string[]> = {
  habit_gym: [
    addDays(today, -6), addDays(today, -5), addDays(today, -4),
    addDays(today, -2), addDays(today, -1), today,
  ],
  habit_leer: [
    addDays(today, -10), addDays(today, -9), addDays(today, -8),
    addDays(today, -3), addDays(today, -2), addDays(today, -1),
  ],
  habit_agua: [addDays(today, -1), today],
};

export const MOCK_ENTRIES: EntryWithCats[] = [
  {
    id: 'e1', type: 'task', title: 'Reunión con el equipo', date: today,
    description: 'Revisión del sprint, demo al cliente', status: 'completed',
    habitDone: null, habitConfigId: null, createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[0]],
  },
  {
    id: 'e2', type: 'task', title: 'Preparar informe mensual', date: today,
    description: 'Incluir métricas de octubre', status: 'in_progress',
    habitDone: null, habitConfigId: null, createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[0]],
  },
  {
    id: 'e3', type: 'task', title: 'Llamar al médico para cita', date: today,
    description: null, status: 'todo',
    habitDone: null, habitConfigId: null, createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[3]],
  },
  {
    id: 'e4', type: 'fact', title: 'Me llamó mamá para ver cómo estoy', date: today,
    description: 'Estuvo media hora, hablamos de las vacaciones de Navidad',
    status: null, habitDone: null, habitConfigId: null, createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[5]],
  },
  {
    id: 'e5', type: 'fact', title: 'Almorcé sushi por primera vez este año', date: today,
    description: null, status: null, habitDone: null, habitConfigId: null,
    createdAt: today, updatedAt: today, isDeleted: false,
    categories: [],
  },
  {
    id: 'e6', type: 'note', title: 'Idea para el proyecto DayLog', date: today,
    description: 'Añadir widget de hábitos en la pantalla de inicio del móvil',
    status: null, habitDone: null, habitConfigId: null, createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[4], MOCK_CATEGORIES[6]],
  },
  {
    id: 'e7', type: 'habit', title: 'Gym — día de piernas', date: today,
    description: '45 min, sentadillas + prensa', status: null, habitDone: true,
    habitConfigId: 'habit_gym', createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[3]],
  },
  {
    id: 'e8', type: 'habit', title: 'Leer 30 minutos', date: today,
    description: null, status: null, habitDone: false,
    habitConfigId: 'habit_leer', createdAt: today, updatedAt: today, isDeleted: false,
    categories: [MOCK_CATEGORIES[4]],
  },
];

// ─── Analytics mock data ──────────────────────────────────────────────────────

// Deterministic daily counts (reproducible across renders)
const DAILY_WEEK = [3, 5, 2, 4, 6, 3, 8].map((count, i) => ({
  date: addDays(today, -(6 - i)),
  count,
}));

const DAILY_MONTH = Array.from({ length: dayjs(today).date() }, (_, i) => ({
  date: dayjs(today).startOf('month').add(i, 'day').format('YYYY-MM-DD'),
  count: [2, 4, 3, 5, 1, 6, 4, 3, 5, 2, 7, 4, 3, 5, 2, 6, 4, 3, 2, 5, 3, 4, 6, 3, 5, 2, 4, 3, 5, 4, 8][i] ?? 3,
}));

const DAILY_YEAR = Array.from({ length: dayjs(today).diff(dayjs(today).startOf('year'), 'day') + 1 }, (_, i) => ({
  date: dayjs(today).startOf('year').add(i, 'day').format('YYYY-MM-DD'),
  count: Math.max(1, Math.round(3 + Math.sin(i / 10) * 2 + (i % 7 === 5 || i % 7 === 6 ? -1 : 0))),
}));

export function getMockStats(period: PeriodKey): PeriodStats {
  const periodData: Record<PeriodKey, PeriodStats> = {
    week: {
      startDate: addDays(today, -6),
      endDate: today,
      totalEntries: 31,
      byType: { task: 10, fact: 10, note: 5, habit: 6 },
      taskCompletionRate: 0.70,
      habitCompletionRate: 0.67,
      byCategory: [
        { categoryId: 'cat_laboral',   count: 12 },
        { categoryId: 'cat_deportivo', count: 8  },
        { categoryId: 'cat_personal',  count: 6  },
        { categoryId: 'cat_hobbie',    count: 5  },
        { categoryId: 'cat_familiar',  count: 4  },
        { categoryId: 'cat_salud',     count: 3  },
      ],
      dailyCounts: DAILY_WEEK,
    },
    month: {
      startDate: dayjs(today).startOf('month').format('YYYY-MM-DD'),
      endDate: today,
      totalEntries: 124,
      byType: { task: 42, fact: 38, note: 21, habit: 23 },
      taskCompletionRate: 0.65,
      habitCompletionRate: 0.72,
      byCategory: [
        { categoryId: 'cat_laboral',   count: 48 },
        { categoryId: 'cat_deportivo', count: 32 },
        { categoryId: 'cat_personal',  count: 24 },
        { categoryId: 'cat_hobbie',    count: 19 },
        { categoryId: 'cat_familiar',  count: 16 },
        { categoryId: 'cat_salud',     count: 12 },
        { categoryId: 'cat_meta',      count: 8  },
        { categoryId: 'cat_amistad',   count: 6  },
      ],
      dailyCounts: DAILY_MONTH,
    },
    year: {
      startDate: dayjs(today).startOf('year').format('YYYY-MM-DD'),
      endDate: today,
      totalEntries: 1340,
      byType: { task: 452, fact: 411, note: 223, habit: 254 },
      taskCompletionRate: 0.68,
      habitCompletionRate: 0.58,
      byCategory: [
        { categoryId: 'cat_laboral',   count: 512 },
        { categoryId: 'cat_deportivo', count: 348 },
        { categoryId: 'cat_personal',  count: 261 },
        { categoryId: 'cat_hobbie',    count: 204 },
        { categoryId: 'cat_familiar',  count: 172 },
        { categoryId: 'cat_salud',     count: 131 },
        { categoryId: 'cat_meta',      count: 86  },
        { categoryId: 'cat_amistad',   count: 64  },
      ],
      dailyCounts: DAILY_YEAR,
    },
  } as const;

  return periodData[period];
}
