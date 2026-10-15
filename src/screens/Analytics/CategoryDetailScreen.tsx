import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Text, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AnalyticsStackParamList } from '@navigation/types';
import { useCategoriesStore } from '@stores/categoriesStore';
import { useJournalStore, type EntryWithCats } from '@stores/journalStore';
import { EntryCard } from '@components/EntryCard';
import { inArray, and, between, eq } from 'drizzle-orm';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { MOCK_ENTRIES } from '@db/mockData';

type Route = RouteProp<AnalyticsStackParamList, 'CategoryDetail'>;

export function CategoryDetailScreen() {
  const theme = useTheme();
  const route = useRoute<Route>();
  const { categoryId, startDate, endDate } = route.params;
  const { categories } = useCategoriesStore();
  const { setTaskStatus, setHabitDone } = useJournalStore();
  const category = categories.find((c) => c.id === categoryId);

  const [entries, setEntries] = useState<EntryWithCats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [categoryId, startDate, endDate]);

  async function loadEntries() {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const filtered = MOCK_ENTRIES.filter((e) =>
          e.categories.some((c) => c.id === categoryId) &&
          e.date >= startDate &&
          e.date <= endDate,
        );
        setEntries(filtered);
        setLoading(false);
        return;
      }

      const { db } = require('@db/database');
      const { entries: entriesTable, entryCategories, categories: catsTable } = require('@db/schema');

      const catEntries = await db
        .select({ entryId: entryCategories.entryId })
        .from(entryCategories)
        .innerJoin(entriesTable, eq(entryCategories.entryId, entriesTable.id))
        .where(
          and(
            eq(entryCategories.categoryId, categoryId),
            between(entriesTable.date, startDate, endDate),
            eq(entriesTable.isDeleted, false),
          ),
        )
        .orderBy(entriesTable.date);

      const ids = catEntries.map((r: any) => r.entryId);
      if (ids.length === 0) { setEntries([]); setLoading(false); return; }

      const rows = await db
        .select()
        .from(entriesTable)
        .where(inArray(entriesTable.id, ids));

      const ecRows = await db
        .select()
        .from(entryCategories)
        .where(inArray(entryCategories.entryId, ids));

      const catIds = [...new Set(ecRows.map((r: any) => r.categoryId))];
      const cats = catIds.length > 0
        ? await db.select().from(catsTable).where(inArray(catsTable.id, catIds))
        : [];

      const catMap = new Map(cats.map((c: any) => [c.id, c]));
      const ecMap = new Map<string, any[]>();
      for (const ec of ecRows) {
        const list = ecMap.get(ec.entryId) ?? [];
        const cat = catMap.get(ec.categoryId);
        if (cat) list.push(cat);
        ecMap.set(ec.entryId, list);
      }

      const enriched = rows.map((r: any) => ({
        ...r,
        categories: ecMap.get(r.id) ?? [],
      }));
      setEntries(enriched);
    } finally {
      setLoading(false);
    }
  }

  const periodLabel = `${dayjs(startDate).locale('es').format('D MMM')} – ${dayjs(endDate).locale('es').format('D MMM YYYY')}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      {/* Header */}
      {category && (
        <View style={[styles.header, { backgroundColor: category.color + '18' }]}>
          <View style={[styles.dot, { backgroundColor: category.color }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <View>
            <Text variant="titleMedium" style={{ color: category.color, fontWeight: '700' }}>
              {category.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {periodLabel} · {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
            </Text>
          </View>
        </View>
      )}
      <Divider />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Sin entradas en este período.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => {}}
              onStatusChange={item.type === 'task' ? (s) => setTaskStatus(item.id, s) : undefined}
              onHabitToggle={item.type === 'habit' ? (d) => setHabitDone(item.id, d) : undefined}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 8 },
});
