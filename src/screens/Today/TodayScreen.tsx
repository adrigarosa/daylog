import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { JournalStackParamList } from '@navigation/types';
import { useJournalStore } from '@stores/journalStore';
import { useCategoriesStore } from '@stores/categoriesStore';
import { useHabitStore } from '@stores/habitStore';
import { DateNavigator } from '@components/DateNavigator';
import { EntryCard } from '@components/EntryCard';
import { HabitQuickRow } from '@components/HabitQuickRow';
import { TODAY } from '@utils/dateUtils';
import type { TaskStatus, EntryType } from '@t/index';

type Nav = StackNavigationProp<JournalStackParamList, 'Today'>;

const GROUPS: { type: EntryType; label: string; emptyText: string }[] = [
  { type: 'task',  label: 'Tareas',   emptyText: 'Sin tareas para hoy' },
  { type: 'fact',  label: 'Hechos',   emptyText: '' },
  { type: 'note',  label: 'Notas',    emptyText: '' },
  { type: 'habit', label: 'Hábitos',  emptyText: '' },
];

const FAB_ACTIONS = [
  { icon: 'format-list-checks', label: 'Tarea',  type: 'task'  as EntryType },
  { icon: 'lightning-bolt',     label: 'Hecho',  type: 'fact'  as EntryType },
  { icon: 'note-text-outline',  label: 'Nota',   type: 'note'  as EntryType },
  { icon: 'repeat',             label: 'Hábito', type: 'habit' as EntryType },
];

export function TodayScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const [fabOpen, setFabOpen] = useState(false);

  const { entries, selectedDate, loading, setDate, setTaskStatus, setHabitDone, loadForDate } =
    useJournalStore();
  const { load: loadCategories } = useCategoriesStore();
  const { load: loadHabits, loadQuickLogsForDate } = useHabitStore();

  useEffect(() => {
    loadCategories();
    loadHabits();
    loadForDate(TODAY());
  }, []);

  useEffect(() => {
    loadQuickLogsForDate(selectedDate);
  }, [selectedDate]);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: entries.filter((e) => e.type === g.type),
  })).filter((g) => g.items.length > 0 || g.type === 'task');

  const handleStatusChange = useCallback(
    (id: string, status: TaskStatus) => setTaskStatus(id, status),
    [setTaskStatus],
  );

  const handleHabitToggle = useCallback(
    (id: string, done: boolean) => setHabitDone(id, done),
    [setHabitDone],
  );

  const renderGroup = (group: (typeof grouped)[0]) => {
    if (group.items.length === 0) {
      return (
        <View key={group.type} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text variant="labelLarge" style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>
              {group.label.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {group.emptyText}
          </Text>
        </View>
      );
    }

    return (
      <View key={group.type} style={styles.group}>
        <View style={styles.groupHeader}>
          <Text variant="labelLarge" style={[styles.groupTitle, { color: theme.colors.onSurfaceVariant }]}>
            {group.label.toUpperCase()}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {group.items.length}
          </Text>
        </View>
        {group.items.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onPress={() => nav.navigate('EntryDetail', { entryId: entry.id })}
            onStatusChange={entry.type === 'task' ? (s) => handleStatusChange(entry.id, s) : undefined}
            onHabitToggle={entry.type === 'habit' ? (d) => handleHabitToggle(entry.id, d) : undefined}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <DateNavigator date={selectedDate} onDateChange={setDate} />

      <HabitQuickRow date={selectedDate} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {grouped.map(renderGroup)}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={FAB_ACTIONS.map((a) => ({
          icon: a.icon,
          label: a.label,
          onPress: () => nav.navigate('AddEditEntry', { type: a.type, date: selectedDate }),
        }))}
        onStateChange={({ open }) => setFabOpen(open)}
        fabStyle={{ backgroundColor: theme.colors.primary }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 100 },
  group: { marginBottom: 8 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  groupTitle: { letterSpacing: 0.8, fontWeight: '700' },
  emptyText: { paddingHorizontal: 20, paddingBottom: 8, fontSize: 13, fontStyle: 'italic' },
  bottomPad: { height: 80 },
});
