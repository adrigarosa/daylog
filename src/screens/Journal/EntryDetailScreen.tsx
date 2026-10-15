import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Divider, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { JournalStackParamList } from '@navigation/types';
import { useJournalStore } from '@stores/journalStore';
import { useCategoriesStore } from '@stores/categoriesStore';
import { StatusPill } from '@components/StatusPill';
import { CategoryBadge } from '@components/CategoryBadge';
import { typeColors } from '@theme/colors';
import { typeLabels } from './typeLabels';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

type Nav = StackNavigationProp<JournalStackParamList, 'EntryDetail'>;
type Route = RouteProp<JournalStackParamList, 'EntryDetail'>;

export function EntryDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { entries, setTaskStatus, setHabitDone, deleteEntry } = useJournalStore();

  const entry = entries.find((e) => e.id === route.params.entryId);

  useEffect(() => {
    if (!entry) nav.goBack();
  }, [entry]);

  if (!entry) return null;

  const accentColor = typeColors[entry.type] ?? '#9E9E9E';

  const handleDelete = () => {
    Alert.alert(
      'Eliminar entrada',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entry.id);
            nav.goBack();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: accentColor + '22' }]}>
          <Text style={[styles.typeText, { color: accentColor }]}>
            {typeLabels[entry.type]}
          </Text>
        </View>

        {/* Title */}
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          {entry.title}
        </Text>

        {/* Date */}
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {dayjs(entry.date).locale('es').format('dddd D [de] MMMM [de] YYYY')}
        </Text>

        {/* Description */}
        {!!entry.description && (
          <>
            <Divider style={styles.divider} />
            <Text style={[styles.desc, { color: theme.colors.onBackground }]}>
              {entry.description}
            </Text>
          </>
        )}

        <Divider style={styles.divider} />

        {/* Status (tasks) */}
        {entry.type === 'task' && entry.status && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Estado</Text>
            <StatusPill
              status={entry.status}
              onPress={(next) => setTaskStatus(entry.id, next)}
            />
          </View>
        )}

        {/* Habit done */}
        {entry.type === 'habit' && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Realizado hoy</Text>
            <Button
              mode={entry.habitDone ? 'contained' : 'outlined'}
              icon={entry.habitDone ? 'check-circle' : 'circle-outline'}
              onPress={() => setHabitDone(entry.id, !entry.habitDone)}
              compact
            >
              {entry.habitDone ? 'Sí' : 'No'}
            </Button>
          </View>
        )}

        {/* Categories */}
        {entry.categories.length > 0 && (
          <>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant, marginBottom: 8 }]}>
              Categorías
            </Text>
            <View style={styles.catRow}>
              {entry.categories.map((cat) => (
                <CategoryBadge key={cat.id} category={cat} size="md" />
              ))}
            </View>
          </>
        )}

        <Divider style={styles.divider} />

        {/* Timestamps */}
        <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          Creado: {dayjs(entry.createdAt).format('D MMM YYYY, HH:mm')}
        </Text>
        {entry.updatedAt !== entry.createdAt && (
          <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
            Editado: {dayjs(entry.updatedAt).format('D MMM YYYY, HH:mm')}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => nav.navigate('AddEditEntry', { entryId: entry.id })}
            style={styles.btn}
          >
            Editar
          </Button>
          <Button
            mode="outlined"
            icon="delete-outline"
            onPress={handleDelete}
            textColor={theme.colors.error}
            style={[styles.btn, { borderColor: theme.colors.error }]}
          >
            Eliminar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 8 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  typeText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontWeight: '700', lineHeight: 32 },
  date: { fontSize: 14, marginBottom: 4, textTransform: 'capitalize' },
  desc: { fontSize: 16, lineHeight: 24 },
  divider: { marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1 },
});
