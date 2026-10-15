import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, FAB, Switch, Divider, useTheme, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { SettingsStackParamList } from '@navigation/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useHabitStore } from '@stores/habitStore';
import type { HabitConfig } from '@t/index';
import { calculateStreak, formatStreakLabel } from '@utils/streakCalculator';

type Nav = StackNavigationProp<SettingsStackParamList, 'HabitsConfig'>;

interface HabitWithStreak extends HabitConfig {
  currentStreak: number;
  bestStreak: number;
}

export function HabitsConfigScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { habitConfigs, load, reload, toggleActive, deleteHabit, getStreakResult } = useHabitStore();
  const [enriched, setEnriched] = useState<HabitWithStreak[]>([]);
  const [loadingStreaks, setLoadingStreaks] = useState(false);

  useEffect(() => {
    load().then(() => loadStreaks());
  }, []);

  useEffect(() => {
    loadStreaks();
  }, [habitConfigs]);

  async function loadStreaks() {
    if (habitConfigs.length === 0) { setEnriched([]); return; }
    setLoadingStreaks(true);
    const results = await Promise.all(
      habitConfigs.map(async (h) => {
        const streak = await getStreakResult(h.id);
        return { ...h, currentStreak: streak.current, bestStreak: streak.best };
      }),
    );
    setEnriched(results);
    setLoadingStreaks(false);
  }

  const handleDelete = useCallback((habit: HabitConfig) => {
    Alert.alert(
      `Eliminar "${habit.name}"`,
      'El historial de entradas vinculadas no se elimina, solo la configuración del hábito.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ],
    );
  }, [deleteHabit]);

  const renderItem = ({ item }: { item: HabitWithStreak }) => {
    const accent = item.color ?? theme.colors.primary;
    return (
      <TouchableRipple onPress={() => nav.navigate('HabitDetail', { habitId: item.id })}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: accent }]}>
            <Text style={styles.dotIcon}>🔄</Text>
          </View>

          <View style={styles.info}>
            <Text variant="bodyLarge" style={{ fontWeight: '500', color: theme.colors.onSurface }}>
              {item.name}
            </Text>
            {!!item.description && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <View style={styles.streakRow}>
              <Text style={[styles.streakBadge, { color: item.currentStreak > 0 ? '#FF6D00' : theme.colors.outline }]}>
                🔥 {formatStreakLabel(item.currentStreak)}
              </Text>
              <Text style={[styles.streakBadge, { color: item.bestStreak > 0 ? '#F9A825' : theme.colors.outline }]}>
                ⭐ mejor: {formatStreakLabel(item.bestStreak)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableRipple
              onPress={() => handleDelete(item)}
              borderless
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
            </TouchableRipple>
            <Switch
              value={item.isActive}
              onValueChange={(v) => toggleActive(item.id, v)}
              color={accent}
            />
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      {loadingStreaks && enriched.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={enriched}
          keyExtractor={(h) => h.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              Los hábitos activos aparecen en la fila de check rápido de la pantalla Hoy.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Sin hábitos configurados. Toca + para añadir uno.
              </Text>
            </View>
          }
        />
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => nav.navigate('HabitDetail', {})}
        label="Nuevo hábito"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 100 },
  hint: { padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  dotIcon: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  streakRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  streakBadge: { fontSize: 12, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4, borderRadius: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
