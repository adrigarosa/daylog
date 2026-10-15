import { Platform } from 'react-native';
import { create } from 'zustand';
import { db } from '@db/database';
import { createCategoryRepository } from '@repositories/categoryRepository';
import type { CategoryRow, KeywordRow } from '@db/schema';
import { MOCK_CATEGORIES } from '@db/mockData';

const IS_WEB = Platform.OS === 'web';
const categoryRepo = IS_WEB ? null : createCategoryRepository(db);

interface CategoriesState {
  categories: CategoryRow[];
  keywords: KeywordRow[];
  loaded: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  addCategory: (name: string, color: string, icon: string) => Promise<CategoryRow>;
  updateCategory: (id: string, patch: Partial<Pick<CategoryRow, 'name' | 'color' | 'icon'>>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addKeyword: (keyword: string, categoryId: string) => Promise<void>;
  removeKeyword: (keywordId: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  keywords: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    await get().reload();
  },

  reload: async () => {
    if (IS_WEB) {
      set({ categories: MOCK_CATEGORIES, keywords: [], loaded: true });
      return;
    }
    const [cats, kws] = await Promise.all([
      categoryRepo!.findAll(),
      categoryRepo!.findAllKeywords(),
    ]);
    set({ categories: cats, keywords: kws, loaded: true });
  },

  addCategory: async (name, color, icon) => {
    if (IS_WEB) return {} as CategoryRow;
    const cat = await categoryRepo!.create({ name, color, icon });
    await get().reload();
    return cat;
  },

  updateCategory: async (id, patch) => {
    if (IS_WEB) return;
    await categoryRepo!.update(id, patch);
    await get().reload();
  },

  removeCategory: async (id) => {
    if (IS_WEB) return;
    await categoryRepo!.remove(id);
    await get().reload();
  },

  addKeyword: async (keyword, categoryId) => {
    if (IS_WEB) return;
    await categoryRepo!.addKeyword(keyword, categoryId);
    await get().reload();
  },

  removeKeyword: async (keywordId) => {
    if (IS_WEB) return;
    await categoryRepo!.removeKeyword(keywordId);
    await get().reload();
  },
}));
