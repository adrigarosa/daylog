import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useHabitStore } from '@stores/habitStore';

interface Props {
  date: string;
}

export function HabitQuickRow({ date }: Props) {
  const theme = useTheme();
  const { habitConfigs, quickLogs, toggleQuickLog } = useHabitStore();

  const activeHabits = habitConfigs.filter((h) => h.isActive);
  if (activeHabits.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>HÁBITOS DE HOY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {activeHabits.map((habit) => {
          const log = quickLogs.find((l) => l.habitConfigId === habit.id && l.date === date);
          const isDone = log?.done === true;
          const accentColor = habit.color ?? theme.colors.primary;

          return (
            <TouchableOpacity
              key={habit.id}
              onPress={() => toggleQuickLog(habit.id, habit.name, date)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isDone ? accentColor + '28' : theme.colors.surfaceVariant,
                  borderColor: isDone ? accentColor : theme.colors.outline,
                },
              ]}
            >
              <Text style={styles.checkIcon}>{isDone ? '✅' : '⭕'}</Text>
              <Text
                style={[
                  styles.chipText,
                  { color: isDone ? accentColor : theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 16,
    marginBottom: 6,
  },
  row: { paddingHorizontal: 12, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    maxWidth: 160,
  },
  checkIcon: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: '500' },
});
