import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, SegmentedButtons, Card, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AnalyticsStackParamList } from '@navigation/types';
import { useAnalyticsStore } from '@stores/analyticsStore';
import { useCategoriesStore } from '@stores/categoriesStore';
import { useHabitStore } from '@stores/habitStore';
import { CategoryDonut } from '@components/charts/CategoryDonut';
import { DailyBarChart } from '@components/charts/DailyBarChart';
import { HabitHeatmap } from '@components/charts/HabitHeatmap';
import { getPeriodDates } from '@services/statsService';
import type { PeriodKey } from '@services/statsService';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<AnalyticsStackParamList, 'AnalyticsOverview'>;

const PERIOD_OPTIONS = [
  { value: 'week',  label: '7 días' },
  { value: 'month', label: 'Mes'    },
  { value: 'year',  label: 'Año'    },
];

const TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  task:  { label: 'Tareas',  emoji: '📋', color: '#6C63FF' },
  fact:  { label: 'Hechos',  emoji: '⚡', color: '#00BCD4' },
  note:  { label: 'Notas',   emoji: '📝', color: '#FF9800' },
  habit: { label: 'Hábitos', emoji: '🔄', color: '#4CAF50' },
};

export function AnalyticsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { period, stats, loading, setPeriod, loadStats } = useAnalyticsStore();
  const { categories, load: loadCats } = useCategoriesStore();
  const { habitConfigs, load: loadHabits, getStreakResult } = useHabitStore();
  const [habitRows, setHabitRows] = useState<
    { habit: (typeof habitConfigs)[0]; doneDates: string[]; currentStreak: number }[]
  >([]);

  async function loadHabitData() {
    const activeHabits = habitConfigs.filter((h) => h.isActive);
    const rows = await Promise.all(
      activeHabits.map(async (h) => {
        const result = await getStreakResult(h.id);
        // For heatmap: get done dates in the period
        let doneDates: string[] = [];
        if (Platform.OS !== 'web') {
          // Native: fetch from DB
          const { db } = require('@db/database');
          const { entries } = require('@db/schema');
          const { and, between, eq } = require('drizzle-orm');
          const { startDate, endDate } = getPeriodDates(period);
          const rows = await db
            .select({ date: entries.date })
            .from(entries)
            .where(and(eq(entries.habitConfigId, h.id), eq(entries.habitDone, true), eq(entries.isDeleted, false), between(entries.date, startDate, endDate)));
          doneDates = rows.map((r: any) => r.date);
        } else {
          // Web: use mock habit done dates
          const { MOCK_HABIT_DONE_DATES } = require('@db/mockData');
          doneDates = MOCK_HABIT_DONE_DATES[h.id] ?? [];
        }
        return { habit: h, doneDates, currentStreak: result.current };
      }),
    );
    setHabitRows(rows);
  }

  useEffect(() => {
    const init = async () => {
      loadCats();
      loadHabits();
      loadStats();
      await loadHabitData();
    };
    init();
  }, [habitConfigs, period]);

  const { startDate, endDate } = getPeriodDates(period);
  const periodLabel = period === 'week'
    ? `${dayjs(startDate).format('D MMM')} – ${dayjs(endDate).format('D MMM YYYY')}`
    : period === 'month'
    ? dayjs(endDate).format('MMMM YYYY')
    : dayjs(endDate).format('YYYY');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Period selector */}
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as PeriodKey)}
          buttons={PERIOD_OPTIONS}
          style={styles.periodSelector}
        />

        <Text variant="bodySmall" style={[styles.periodLabel, { color: theme.colors.onSurfaceVariant }]}>
          {periodLabel}
        </Text>

        {loading || !stats ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View style={styles.cardsRow}>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardNumber}>{stats.totalEntries}</Text>
                  <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>entradas</Text>
                </Card.Content>
              </Card>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardNumber}>
                    {stats.taskCompletionRate != null ? `${Math.round(stats.taskCompletionRate * 100)}%` : '—'}
                  </Text>
                  <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>tareas ✓</Text>
                </Card.Content>
              </Card>
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.cardNumber}>
                    {stats.habitCompletionRate != null ? `${Math.round(stats.habitCompletionRate * 100)}%` : '—'}
                  </Text>
                  <Text style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>hábitos 🔄</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Type breakdown */}
            <View style={styles.typeRow}>
              {Object.entries(TYPE_META).map(([type, meta]) => {
                const n = stats.byType[type as keyof typeof stats.byType] ?? 0;
                return (
                  <View key={type} style={[styles.typeChip, { backgroundColor: meta.color + '22' }]}>
                    <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
                    <Text style={[styles.typeCount, { color: meta.color }]}>{n}</Text>
                    <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                );
              })}
            </View>

            <Divider style={styles.divider} />

            {/* Category donut */}
            {stats.byCategory.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                  Distribución por categoría
                </Text>
                <CategoryDonut
                  data={stats.byCategory}
                  categories={categories}
                  total={stats.totalEntries}
                  onPressCategory={(catId) =>
                    nav.navigate('CategoryDetail', { categoryId: catId, startDate, endDate })
                  }
                />
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Daily activity */}
            {stats.dailyCounts.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                  Actividad diaria
                </Text>
                <DailyBarChart
                  data={stats.dailyCounts}
                  maxBars={period === 'week' ? 7 : period === 'month' ? 31 : 365}
                />
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Habit heatmap */}
            <View style={styles.section}>
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                Hábitos — últimas 5 semanas
              </Text>
              <HabitHeatmap rows={habitRows} />
            </View>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  periodSelector: { marginBottom: 4 },
  periodLabel: { textAlign: 'center', marginBottom: 16, textTransform: 'capitalize' },
  loadingBox: { height: 200, alignItems: 'center', justifyContent: 'center' },
  cardsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  card: { flex: 1, elevation: 1 },
  cardContent: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  cardNumber: { fontSize: 22, fontWeight: '700' },
  cardLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  typeChip: { flex: 1, borderRadius: 10, padding: 8, alignItems: 'center', gap: 2 },
  typeCount: { fontSize: 16, fontWeight: '700' },
  typeLabel: { fontSize: 10, fontWeight: '500' },
  divider: { marginVertical: 16 },
  section: { gap: 12 },
  sectionTitle: { fontWeight: '700' },
  bottomPad: { height: 32 },
});
