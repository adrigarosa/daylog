import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, useTheme, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { SettingsStackParamList } from '@navigation/types';
import { useCategoriesStore } from '@stores/categoriesStore';
import { ColorPicker } from '@components/ColorPicker';
import { EmojiPicker } from '@components/EmojiPicker';

type Nav = StackNavigationProp<SettingsStackParamList, 'CategoryDetail'>;
type Route = RouteProp<SettingsStackParamList, 'CategoryDetail'>;

export function CategoryDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { categories, keywords, addCategory, updateCategory } = useCategoriesStore();

  const categoryId = route.params?.categoryId;
  const existing = categoryId ? categories.find((c) => c.id === categoryId) : null;
  const isEdit = !!existing;
  const isSystem = existing?.isSystem ?? false;

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? '#6C63FF');
  const [icon, setIcon] = useState(existing?.icon ?? '🏷️');
  const [saving, setSaving] = useState(false);

  const keywordCount = keywords.filter((k) => k.categoryId === categoryId).length;

  const validate = (): string | null => {
    if (!name.trim()) return 'El nombre es obligatorio.';
    if (name.trim().length > 30) return 'El nombre no puede tener más de 30 caracteres.';
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return 'El color debe ser un hex válido (ej. #FF5733).';
    if (!icon.trim()) return 'Elige un icono.';
    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== categoryId,
    );
    if (duplicate) return `Ya existe una categoría llamada "${name.trim()}".`;
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { Alert.alert('Error', error); return; }
    setSaving(true);
    try {
      if (isEdit && categoryId) {
        await updateCategory(categoryId, { name: name.trim(), color, icon });
      } else {
        await addCategory(name.trim(), color, icon);
      }
      nav.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la categoría.');
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
            <Text style={styles.dotIcon}>{icon}</Text>
          </View>
          <Text variant="titleMedium" style={{ color, fontWeight: '700' }}>
            {name || 'Vista previa'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Name */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            NOMBRE
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="Ej. Trabajo, Salud, Familia…"
            maxLength={30}
            disabled={isSystem}
          />
          {isSystem && (
            <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              El nombre de las categorías del sistema no se puede cambiar.
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Color */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            COLOR
          </Text>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        <Divider style={styles.divider} />

        {/* Icon */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            ICONO
          </Text>
          <EmojiPicker value={icon} onChange={setIcon} />
        </View>

        {/* Keywords shortcut (edit mode only) */}
        {isEdit && categoryId && (
          <>
            <Divider style={styles.divider} />
            <List.Item
              title="Palabras clave"
              description={`${keywordCount} palabras clave configuradas`}
              left={(p) => <List.Icon {...p} icon="tag-text-outline" />}
              right={(p) => <List.Icon {...p} icon="chevron-right" />}
              onPress={() => nav.navigate('Keywords', { categoryId })}
              style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 8 }}
            />
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => nav.goBack()} style={styles.btn}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.btn}
          >
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
  section: { gap: 10, paddingVertical: 4 },
  label: { letterSpacing: 0.8, fontWeight: '700' },
  hint: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1 },
});
