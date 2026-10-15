import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CalendarStackParamList } from '@navigation/types';
import { useJournalStore } from '@stores/journalStore';
import { EntryCard } from '@components/EntryCard';
import { formatDayLabel } from '@utils/dateUtils';
import type { TaskStatus } from '@t/index';

type Route = RouteProp<CalendarStackParamList, 'DayDetail'>;

export function DayDetailScreen() {
  const theme = useTheme();
  const route = useRoute<Route>();
  const { date } = route.params;
  const { entries, loading, loadForDate, setTaskStatus, setHabitDone } = useJournalStore();

  useEffect(() => {
    loadForDate(date);
  }, [date]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <Text variant="titleMedium" style={[styles.dateHeader, { color: theme.colors.onBackground }]}>
        {formatDayLabel(date)}
      </Text>
      <Divider />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Sin entradas este día</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onPress={() => {}} // read-only in calendar detail
              onStatusChange={entry.type === 'task' ? (s: TaskStatus) => setTaskStatus(entry.id, s) : undefined}
              onHabitToggle={entry.type === 'habit' ? (d: boolean) => setHabitDone(entry.id, d) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateHeader: { padding: 16, fontWeight: '600', textTransform: 'capitalize' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingVertical: 8 },
});
