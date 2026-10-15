import type { NewCategory } from '../schema';

export const DEFAULT_CATEGORIES: NewCategory[] = [
  { id: 'cat_familiar',     name: 'Familiar',      color: '#E91E63', icon: '👨‍👩‍👧‍👦', isSystem: true,  sortOrder: 0 },
  { id: 'cat_laboral',      name: 'Laboral',        color: '#2196F3', icon: '💼',      isSystem: true,  sortOrder: 1 },
  { id: 'cat_personal',     name: 'Personal',       color: '#9C27B0', icon: '🧘',      isSystem: true,  sortOrder: 2 },
  { id: 'cat_hobbie',       name: 'Hobbie',         color: '#FF9800', icon: '🎨',      isSystem: true,  sortOrder: 3 },
  { id: 'cat_economico',    name: 'Económico',      color: '#4CAF50', icon: '💰',      isSystem: true,  sortOrder: 4 },
  { id: 'cat_anecdotico',   name: 'Anecdótico',     color: '#795548', icon: '📖',      isSystem: true,  sortOrder: 5 },
  { id: 'cat_gracioso',     name: 'Gracioso',       color: '#FFC107', icon: '😄',      isSystem: true,  sortOrder: 6 },
  { id: 'cat_deportivo',    name: 'Deportivo',      color: '#009688', icon: '🏃',      isSystem: true,  sortOrder: 7 },
  { id: 'cat_salud',        name: 'Salud',          color: '#F44336', icon: '❤️',      isSystem: true,  sortOrder: 8 },
  { id: 'cat_alimentacion', name: 'Alimentación',   color: '#FF5722', icon: '🍎',      isSystem: true,  sortOrder: 9 },
  { id: 'cat_meta',         name: 'Meta',           color: '#3F51B5', icon: '🎯',      isSystem: true,  sortOrder: 10 },
  { id: 'cat_amistad',      name: 'Amistad',        color: '#00BCD4', icon: '🤝',      isSystem: true,  sortOrder: 11 },
  { id: 'cat_compras',      name: 'Compras',        color: '#8BC34A', icon: '🛒',      isSystem: true,  sortOrder: 12 },
  { id: 'cat_proyectos',    name: 'Proyectos',      color: '#673AB7', icon: '🚀',      isSystem: true,  sortOrder: 13 },
];
