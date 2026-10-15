import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, Divider, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { SettingsStackParamList } from '@navigation/types';
import { useHabitStore } from '@stores/habitStore';
import { useCategoriesStore } from '@stores/categoriesStore';
import { ColorPicker } from '@components/ColorPicker';

type Nav = StackNavigationProp<SettingsStackParamList, 'HabitDetail'>;
type Route = RouteProp<SettingsStackParamList, 'HabitDetail'>;

export function HabitDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { habitConfigs, createHabit, updateHabit } = useHabitStore();
  const { categories, load: loadCats } = useCategoriesStore();

  const habitId = route.params?.habitId;
  const existing = habitId ? habitConfigs.find((h) => h.id === habitId) : null;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [color, setColor] = useState(existing?.color ?? '#009688');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(existing?.categoryIds ?? []);
  const [keywords, setKeywords] = useState<string[]>(existing?.keywords ?? []);
  const [newKeyword, setNewKeyword] = useState('');
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCats(); }, []);

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setNewKeyword('');
  };

  const removeKeyword = (kw: string) => setKeywords((prev) => prev.filter((k) => k !== kw));

  const toggleCategory = (id: string) =>
    setSelectedCatIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Campo requerido', 'El nombre es obligatorio.'); return; }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || null,
        color,
        categoryIds: selectedCatIds,
        keywords,
        isActive,
      };
      if (isEdit && habitId) {
        await updateHabit(habitId, data);
      } else {
        await createHabit(data);
      }
      nav.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el hábito.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: color + '22' }]}>
          <View style={[styles.dot, { backgroundColor: color }]}>
            <Text style={styles.dotIcon}>🔄</Text>
          </View>
          <Text variant="titleMedium" style={{ color, fontWeight: '700' }}>
            {name || 'Vista previa'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Name */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>NOMBRE *</Text>
          <TextInput value={name} onChangeText={setName} mode="outlined" placeholder="Ej. Gym, Leer, Meditación…" maxLength={50} autoFocus={!isEdit} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <TextInput value={description} onChangeText={setDescription} label="Descripción (opcional)" mode="outlined" multiline numberOfLines={2} maxLength={200} />
        </View>

        <Divider style={styles.divider} />

        {/* Color */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>COLOR</Text>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        <Divider style={styles.divider} />

        {/* Categories */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>CATEGORÍAS</Text>
          <View style={styles.chips}>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                selected={selectedCatIds.includes(cat.id)}
                onPress={() => toggleCategory(cat.id)}
                style={selectedCatIds.includes(cat.id) ? { backgroundColor: cat.color + '33' } : undefined}
                textStyle={selectedCatIds.includes(cat.id) ? { color: cat.color } : undefined}
                compact
              >
                {cat.icon} {cat.name}
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Keywords */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            PALABRAS CLAVE (auto-detección)
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Si una entrada tipo "Hábito" contiene estas palabras, se vinculará a este hábito automáticamente.
          </Text>
          <View style={styles.kwInput}>
            <TextInput
              value={newKeyword}
              onChangeText={setNewKeyword}
              placeholder="Añadir palabra clave…"
              mode="outlined"
              dense
              style={{ flex: 1 }}
              onSubmitEditing={addKeyword}
              returnKeyType="done"
              autoCapitalize="none"
            />
            <Button mode="outlined" onPress={addKeyword} disabled={!newKeyword.trim()} compact>
              +
            </Button>
          </View>
          {keywords.length > 0 && (
            <View style={styles.chips}>
              {keywords.map((kw) => (
                <Chip
                  key={kw}
                  onClose={() => removeKeyword(kw)}
                  style={{ backgroundColor: color + '22' }}
                  textStyle={{ color }}
                  compact
                >
                  {kw}
                </Chip>
              ))}
            </View>
          )}
        </View>

        {/* Active toggle (edit only) */}
        {isEdit && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge">Hábito activo</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Los hábitos inactivos no aparecen en el check rápido.
                </Text>
              </View>
              <Switch value={isActive} onValueChange={setIsActive} color={color} />
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => nav.goBack()} style={styles.btn}>Cancelar</Button>
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving || !name.trim()} style={styles.btn}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 4 },
  preview: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  dot: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  dotIcon: { fontSize: 26 },
  divider: { marginVertical: 8 },
  section: { gap: 8, paddingVertical: 4 },
  label: { letterSpacing: 0.8, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kwInput: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1 },
});
