import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import type { TaskStatus } from '@t/index';

const STATUS_META: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  todo:        { label: 'Pendiente',   bg: '#E0E0E0', text: '#616161' },
  in_progress: { label: 'En progreso', bg: '#BBDEFB', text: '#1565C0' },
  completed:   { label: 'Completada',  bg: '#C8E6C9', text: '#2E7D32' },
  cancelled:   { label: 'Cancelada',   bg: '#FFCDD2', text: '#C62828' },
};

const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'completed', 'cancelled'];

interface Props {
  status: TaskStatus;
  onPress?: (next: TaskStatus) => void;
  compact?: boolean;
}

export function StatusPill({ status, onPress, compact = false }: Props) {
  const meta = STATUS_META[status];

  const handlePress = () => {
    if (!onPress) return;
    const idx = STATUS_CYCLE.indexOf(status);
    onPress(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  };

  return (
    <TouchableOpacity
      onPress={onPress ? handlePress : undefined}
      disabled={!onPress}
      style={[styles.pill, { backgroundColor: meta.bg }, compact && styles.compact]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: meta.text }, compact && styles.compactLabel]}>
        {meta.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  compact: { paddingHorizontal: 8, paddingVertical: 2 },
  label: { fontSize: 12, fontWeight: '600' },
  compactLabel: { fontSize: 11 },
});
