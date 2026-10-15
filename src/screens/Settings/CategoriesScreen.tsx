import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, FAB, Divider, useTheme, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { SettingsStackParamList } from '@navigation/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCategoriesStore } from '@stores/categoriesStore';
import { db } from '@db/database';
import { createCategoryRepository } from '@repositories/categoryRepository';
import type { CategoryRow } from '@db/schema';

type Nav = StackNavigationProp<SettingsStackParamList, 'Categories'>;
const catRepo = createCategoryRepository(db);

interface CatWithCount extends CategoryRow {
  entryCount: number;
  keywordCount: number;
}

export function CategoriesScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { categories, keywords, reload } = useCategoriesStore();
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadCounts();
  }, [categories]);

  async function loadCounts() {
    const map = await catRepo.getEntryCounts();
    setCounts(map);
  }

  const enriched: CatWithCount[] = categories.map((cat) => ({
    ...cat,
    entryCount: counts.get(cat.id) ?? 0,
    keywordCount: keywords.filter((k) => k.categoryId === cat.id).length,
  }));

  const handleDelete = useCallback((cat: CategoryRow) => {
    if (cat.isSystem) {
      Alert.alert('No se puede eliminar', 'Las categorías del sistema no pueden eliminarse, pero sí editarse.');
      return;
    }
    Alert.alert(
      `Eliminar "${cat.name}"`,
      'Se eliminará la categoría y se desvinculará de todas sus entradas. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await catRepo.remove(cat.id);
            await reload();
            await loadCounts();
          },
        },
      ],
    );
  }, [reload]);

  const renderItem = ({ item }: { item: CatWithCount }) => (
    <TouchableRipple onPress={() => nav.navigate('CategoryDetail', { categoryId: item.id })}>
      <View style={styles.row}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
              {item.name}
            </Text>
            {item.isSystem && (
              <Text style={[styles.systemBadge, { color: theme.colors.onSurfaceVariant }]}>sistema</Text>
            )}
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.keywordCount} palabras clave · {item.entryCount} entradas
          </Text>
        </View>

        <View style={styles.actions}>
          {!item.isSystem && (
            <TouchableRipple onPress={() => handleDelete(item)} borderless style={styles.iconBtn}>
              <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
            </TouchableRipple>
          )}
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.outline} />
        </View>
      </View>
    </TouchableRipple>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <FlatList
        data={enriched}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Toca una categoría para editar su nombre, color, icono o palabras clave.
          </Text>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => nav.navigate('CategoryDetail', {})}
        label="Nueva categoría"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 100 },
  hint: { padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  colorDot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  systemBadge: { fontSize: 11, backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, overflow: 'hidden' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 4, borderRadius: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
