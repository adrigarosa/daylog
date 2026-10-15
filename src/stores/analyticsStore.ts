import { Platform } from 'react-native';
import { create } from 'zustand';
import { db } from '@db/database';
import { getPeriodDates, computeStats, type PeriodKey, type PeriodStats } from '@services/statsService';
import { getMockStats } from '@db/mockData';

const IS_WEB = Platform.OS === 'web';

interface AnalyticsState {
  period: PeriodKey;
  stats: PeriodStats | null;
  loading: boolean;
  setPeriod: (period: PeriodKey) => void;
  loadStats: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  period: 'week',
  stats: null,
  loading: false,

  setPeriod: (period) => {
    set({ period });
    get().loadStats();
  },

  loadStats: async () => {
    const { period } = get();
    set({ loading: true });
    try {
      if (IS_WEB) {
        set({ stats: getMockStats(period), loading: false });
        return;
      }
      const { startDate, endDate } = getPeriodDates(period);
      const stats = await computeStats(db, startDate, endDate);
      set({ stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
