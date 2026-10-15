import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { SettingsStackParamList } from '@navigation/types';
import { useCategoriesStore } from '@stores/categoriesStore';
import type { KeywordRow } from '@db/schema';
import { db } from '@db/database';
import { createCategoryRepository } from '@repositories/categoryRepository';

type Route = RouteProp<SettingsStackParamList, 'Keywords'>;
const catRepo = createCategoryRepository(db);

export function KeywordsScreen() {
  const theme = useTheme();
  const route = useRoute<Route>();
  const { categoryId } = route.params;
  const { categories, reload } = useCategoriesStore();
  const category = categories.find((c) => c.id === categoryId);

  const [kwList, setKwList] = useState<KeywordRow[]>([]);
  const [newKw, setNewKw] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function loadKeywords() {
    setLoading(true);
    const rows = await catRepo.findKeywordsByCategory(categoryId);
    setKwList(rows);
    setLoading(false);
  }

  useEffect(() => { 
    const load = async () => {
      await loadKeywords();
    };
    load();
  }, []);

  const handleAdd = async () => {
    const kw = newKw.trim().toLowerCase();
    if (!kw) return;
    if (kw.length > 50) { Alert.alert('Error', 'La palabra clave no puede tener más de 50 caracteres.'); return; }
    if (kwList.some((k) => k.keyword === kw)) { Alert.alert('Duplicada', 'Esa palabra clave ya existe.'); return; }
    setAdding(true);
    try {
      await catRepo.addKeyword(kw, categoryId);
      await reload();
      await loadKeywords();
      setNewKw('');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = useCallback(async (kw: KeywordRow) => {
    Alert.alert(
      `Eliminar "${kw.keyword}"`,
      kw.isSystem
        ? 'Esta es una palabra clave del sistema. Al eliminarla dejará de auto-categorizar entradas con este término. ¿Continuar?'
        : '¿Eliminar esta palabra clave?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await catRepo.removeKeyword(kw.id);
            await reload();
            setKwList((prev) => prev.filter((k) => k.id !== kw.id));
          },
        },
      ],
    );
  }, [reload]);

  if (!category) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Category header */}
        <View style={[styles.header, { backgroundColor: category.color + '18' }]}>
          <View style={[styles.dot, { backgroundColor: category.color }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <View>
            <Text variant="titleMedium" style={{ color: category.color, fontWeight: '700' }}>
              {category.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {kwList.length} palabras clave
            </Text>
          </View>
        </View>

        <Divider />

        {/* Add keyword bar */}
        <View style={[styles.addBar, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            value={newKw}
            onChangeText={setNewKw}
            placeholder="Añadir palabra clave…"
            mode="outlined"
            dense
            style={styles.input}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={50}
            autoCapitalize="none"
          />
          <Button
            mode="contained"
            onPress={handleAdd}
            loading={adding}
            disabled={adding || !newKw.trim()}
            style={styles.addBtn}
            compact
          >
            Añadir
          </Button>
        </View>

        <Divider />

        {/* Keywords list */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : kwList.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Sin palabras clave. Añade la primera.
            </Text>
          </View>
        ) : (
          <FlatList
            data={kwList}
            keyExtractor={(k) => k.id}
            contentContainerStyle={styles.chipList}
            renderItem={({ item }) => (
              <Chip
                key={item.id}
                onClose={() => handleDelete(item)}
                style={[styles.chip, { backgroundColor: category.color + '22' }]}
                textStyle={{ color: category.color }}
                closeIconAccessibilityLabel="Eliminar"
              >
                {item.keyword}
                {item.isSystem && (
                  <Text style={{ fontSize: 10, color: category.color + 'AA' }}> ·sys</Text>
                )}
              </Chip>
            )}
          />
        )}

        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Las palabras clave se usan para sugerir automáticamente esta categoría al crear entradas.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  addBar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  input: { flex: 1 },
  addBtn: { minWidth: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  chipList: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 32 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
