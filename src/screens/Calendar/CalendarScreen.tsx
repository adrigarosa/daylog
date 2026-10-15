import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { CalendarStackParamList } from '@navigation/types';
import { db } from '@db/database';
import { entries } from '@db/schema';
import { and, between, eq, count, sql } from 'drizzle-orm';
import {
  formatMonthLabel, daysInMonth, firstWeekdayOfMonth,
  startOfMonth, endOfMonth, TODAY, isToday,
} from '@utils/dateUtils';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<CalendarStackParamList, 'CalendarView'>;

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();

  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const [dotMap, setDotMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  async function loadDots() {
    setLoading(true);
    try {
      const start = startOfMonth(year, month);
      const end = endOfMonth(year, month);
      const rows = await db
        .select({ date: entries.date, cnt: count() })
        .from(entries)
        .where(and(between(entries.date, start, end), eq(entries.isDeleted, false)))
        .groupBy(entries.date);
      const map = new Map(rows.map((r) => [r.date, r.cnt]));
      setDotMap(map);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadDots();
    };
    load();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nextIsInFuture = year > now.year() || (year === now.year() && month >= now.month() + 1);
    if (nextIsInFuture) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const totalDays = daysInMonth(year, month);
  const firstWd = firstWeekdayOfMonth(year, month);
  const today = TODAY();
  const isCurrentMonth = year === now.year() && month === now.month() + 1;
  const canGoNext = !isCurrentMonth;

  const cells: Array<{ day: number | null; dateStr: string | null }> = [
    ...Array.from({ length: firstWd }, () => ({ day: null, dateStr: null })),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { day: d, dateStr };
    }),
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView>
        {/* Month navigator */}
        <View style={styles.monthNav}>
          <IconButton icon="chevron-left" onPress={prevMonth} />
          <Text variant="titleLarge" style={[styles.monthLabel, { color: theme.colors.onBackground }]}>
            {formatMonthLabel(year, month)}
          </Text>
          <IconButton icon="chevron-right" onPress={nextMonth} disabled={!canGoNext} />
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={[styles.weekLabel, { color: theme.colors.onSurfaceVariant }]}>{d}</Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : (
          <View style={styles.grid}>
            {cells.map((cell, idx) => {
              if (!cell.day || !cell.dateStr) {
                return <View key={`empty-${idx}`} style={styles.cell} />;
              }
              const isT = isToday(cell.dateStr);
              const isFut = cell.dateStr > today;
              const dotCount = dotMap.get(cell.dateStr) ?? 0;

              return (
                <TouchableOpacity
                  key={cell.dateStr}
                  style={[
                    styles.cell,
                    isT && { backgroundColor: theme.colors.primary + '22' },
                  ]}
                  onPress={() => nav.navigate('DayDetail', { date: cell.dateStr! })}
                  disabled={isFut}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isFut ? theme.colors.outline : theme.colors.onBackground },
                      isT && { color: theme.colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {dotCount > 0 && (
                    <View style={[styles.dots, { justifyContent: 'center' }]}>
                      {Array.from({ length: Math.min(dotCount, 3) }).map((_, i) => (
                        <View
                          key={i}
                          style={[styles.dot, { backgroundColor: theme.colors.primary }]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  monthLabel: { fontWeight: '600', textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, gap: 2 },
  dayText: { fontSize: 15 },
  dots: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
