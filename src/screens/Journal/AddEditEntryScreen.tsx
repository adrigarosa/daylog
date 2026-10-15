import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import {
  Text, TextInput, Button, SegmentedButtons, useTheme, Chip, Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { JournalStackParamList } from '@navigation/types';
import { useJournalStore } from '@stores/journalStore';
import { useCategoriesStore } from '@stores/categoriesStore';
import { StatusPill } from '@components/StatusPill';
import { suggestCategories } from '@services/categorizationEngine';
import { TODAY, toDateObj, fromDateObj } from '@utils/dateUtils';
import type { EntryType, TaskStatus } from '@t/index';

// Conditionally import DateTimePicker (native only)
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type Nav = StackNavigationProp<JournalStackParamList, 'AddEditEntry'>;
type Route = RouteProp<JournalStackParamList, 'AddEditEntry'>;

const TYPE_OPTIONS = [
  { value: 'task',  label: '📋 Tarea'  },
  { value: 'fact',  label: '⚡ Hecho'  },
  { value: 'note',  label: '📝 Nota'   },
  { value: 'habit', label: '🔄 Hábito' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'Pendiente'   },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed',   label: 'Completada'  },
  { value: 'cancelled',   label: 'Cancelada'   },
];

export function AddEditEntryScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { createEntry, updateEntry, entries } = useJournalStore();
  const { categories, keywords, load: loadCats } = useCategoriesStore();

  const isEdit = !!route.params?.entryId;
  const existing = isEdit ? entries.find((e) => e.id === route.params!.entryId) : null;

  const [type, setType] = useState<EntryType>(existing?.type ?? route.params?.type ?? 'task');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [date, setDate] = useState(existing?.date ?? route.params?.date ?? TODAY());
  const [status, setStatus] = useState<TaskStatus>(existing?.status ?? 'todo');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(
    existing?.categories.map((c) => c.id) ?? [],
  );
  const [suggestedCatIds, setSuggestedCatIds] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadCats(); }, []);

  // Auto-categorize on title/description change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!title && !description) { setSuggestedCatIds([]); return; }
      const suggestions = suggestCategories(title, description, keywords);
      const newSuggestions = suggestions
        .filter((s) => !selectedCatIds.includes(s.categoryId))
        .slice(0, 4)
        .map((s) => s.categoryId);
      setSuggestedCatIds(newSuggestions);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [title, description, keywords]);

  const toggleCategory = useCallback((catId: string) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
    setSuggestedCatIds((prev) => prev.filter((id) => id !== catId));
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo requerido', 'El título no puede estar vacío.');
      return;
    }
    setSaving(true);
    try {
      const allCatIds = [...selectedCatIds, ...suggestedCatIds];
      if (isEdit && existing) {
        await updateEntry(existing.id, { title: title.trim(), description: description.trim() || undefined, date });
        // TODO: update categories
      } else {
        await createEntry({
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          status: type === 'task' ? status : undefined,
          habitDone: type === 'habit' ? false : undefined,
          categoryIds: selectedCatIds,
          autoTaggedCategoryIds: suggestedCatIds,
        });
      }
      nav.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la entrada. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const allCatIds = [...new Set([...selectedCatIds, ...suggestedCatIds])];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Type selector */}
        {!isEdit && (
          <View style={styles.section}>
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              TIPO
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <SegmentedButtons
                value={type}
                onValueChange={(v) => setType(v as EntryType)}
                buttons={TYPE_OPTIONS}
                style={styles.typeButtons}
              />
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* Title */}
        <View style={styles.section}>
          <TextInput
            label="Título *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            autoFocus={!isEdit}
            maxLength={200}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <TextInput
            label="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            FECHA
          </Text>
          {Platform.OS === 'web' ? (
            <TextInput
              label="Fecha (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              mode="outlined"
              placeholder="2026-10-13"
            />
          ) : (
            <>
              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {date}
              </Button>
              {showDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={toDateObj(date)}
                  mode="date"
                  display="default"
                  maximumDate={toDateObj(TODAY())}
                  onChange={(_: unknown, d?: Date) => {
                    setShowDatePicker(false);
                    if (d) setDate(fromDateObj(d));
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Status (tasks only) */}
        {type === 'task' && (
          <>
            <Divider />
            <View style={styles.section}>
              <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                ESTADO
              </Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    style={[styles.statusOpt, status === opt.value && styles.statusOptActive]}
                  >
                    <StatusPill status={opt.value} compact />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <Divider />

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.catHeader}>
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              CATEGORÍAS
            </Text>
            {suggestedCatIds.length > 0 && (
              <Text style={[styles.autoLabel, { color: theme.colors.primary }]}>
                ✨ Auto-sugeridas
              </Text>
            )}
          </View>
          <View style={styles.chips}>
            {categories.map((cat) => {
              const isSelected = selectedCatIds.includes(cat.id);
              const isSuggested = suggestedCatIds.includes(cat.id);
              const isActive = isSelected || isSuggested;
              return (
                <Chip
                  key={cat.id}
                  selected={isActive}
                  onPress={() => toggleCategory(cat.id)}
                  style={[
                    styles.chip,
                    isActive && { backgroundColor: cat.color + '33' },
                    isSuggested && !isSelected && styles.chipSuggested,
                  ]}
                  textStyle={isActive ? { color: cat.color, fontWeight: '600' } : undefined}
                  compact
                >
                  {cat.icon} {cat.name}
                </Chip>
              );
            })}
          </View>
          {allCatIds.length > 0 && (
            <Text style={[styles.selectedHint, { color: theme.colors.onSurfaceVariant }]}>
              {allCatIds.length} categoría{allCatIds.length !== 1 ? 's' : ''} seleccionada{allCatIds.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => nav.goBack()} style={styles.btn}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !title.trim()}
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
  section: { paddingVertical: 8, gap: 8 },
  sectionLabel: { letterSpacing: 0.8, fontWeight: '700', marginBottom: 4 },
  typeButtons: { minWidth: 480 },
  dateButton: { alignSelf: 'flex-start' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOpt: { opacity: 0.5 },
  statusOptActive: { opacity: 1 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  autoLabel: { fontSize: 12, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 32 },
  chipSuggested: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#6C63FF' },
  selectedHint: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, justifyContent: 'flex-end' },
  btn: { flex: 1 },
});
