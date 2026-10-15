import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { TODAY, addDays } from '@utils/dateUtils';
import { formatStreakLabel } from '@utils/streakCalculator';
import type { HabitConfig } from '@t/index';

const DAYS = 35; // 5 weeks
const CELL = 14;
const GAP = 3;

interface HabitRow {
  habit: HabitConfig;
  doneDates: string[];
  currentStreak: number;
}

interface Props {
  rows: HabitRow[];
}

export function HabitHeatmap({ rows }: Props) {
  const theme = useTheme();

  if (rows.length === 0) {
    return (
      <Text style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
        Sin hábitos configurados todavía.
      </Text>
    );
  }

  const today = TODAY();
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(today, -(DAYS - 1 - i)));

  return (
    <View style={styles.container}>
      {/* Day-of-week labels */}
      <View style={styles.headerRow}>
        <View style={styles.habitNameCol} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.cells}>
            {dates.map((d, i) => {
              const dow = new Date(d).getDay(); // 0=Sun
              return (
                <View key={d} style={[styles.cell, { backgroundColor: 'transparent' }]}>
                  {dow === 1 ? (
                    <Text style={[styles.dayLabel, { color: theme.colors.onSurfaceVariant }]}>L</Text>
                  ) : dow === 5 ? (
                    <Text style={[styles.dayLabel, { color: theme.colors.onSurfaceVariant }]}>V</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Habit rows */}
      {rows.map(({ habit, doneDates, currentStreak }) => {
        const doneSet = new Set(doneDates);
        const accent = habit.color ?? theme.colors.primary;
        return (
          <View key={habit.id} style={styles.row}>
            <View style={styles.habitNameCol}>
              <Text style={[styles.habitName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {habit.name}
              </Text>
              {currentStreak > 0 && (
                <Text style={{ fontSize: 10, color: '#FF6D00' }}>🔥 {formatStreakLabel(currentStreak)}</Text>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cells}>
                {dates.map((d) => {
                  const isFuture = d > today;
                  const isDone = doneSet.has(d);
                  const isToday = d === today;
                  return (
                    <View
                      key={d}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: isFuture
                            ? 'transparent'
                            : isDone
                            ? accent
                            : theme.colors.surfaceVariant,
                          borderWidth: isToday ? 1.5 : 0,
                          borderColor: isToday ? accent : 'transparent',
                          opacity: isFuture ? 0 : 1,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );
      })}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legendCell, { backgroundColor: theme.colors.surfaceVariant }]} />
        <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>No realizado</Text>
        <View style={[styles.legendCell, { backgroundColor: theme.colors.primary }]} />
        <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Realizado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', height: 16, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  habitNameCol: { width: 80, paddingRight: 8 },
  habitName: { fontSize: 11, fontWeight: '600' },
  cells: { flexDirection: 'row', gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3 },
  dayLabel: { fontSize: 9, textAlign: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, justifyContent: 'flex-end' },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 11 },
});
