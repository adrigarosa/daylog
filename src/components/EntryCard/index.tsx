import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { StatusPill } from '@components/StatusPill';
import { CategoryBadge } from '@components/CategoryBadge';
import { typeColors } from '@theme/colors';
import type { EntryWithCats } from '@stores/journalStore';

const TYPE_ICONS: Record<string, string> = {
  task: '📋',
  fact: '⚡',
  note: '📝',
  habit: '🔄',
};

interface Props {
  entry: EntryWithCats;
  onPress: () => void;
  onStatusChange?: (status: 'todo' | 'in_progress' | 'completed' | 'cancelled') => void;
  onHabitToggle?: (done: boolean) => void;
}

export function EntryCard({ entry, onPress, onStatusChange, onHabitToggle }: Props) {
  const accentColor = typeColors[entry.type] ?? '#9E9E9E';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.wrapper}>
      <View style={[styles.card, { borderLeftColor: accentColor }]}>
        <View style={styles.header}>
          {entry.type === 'habit' ? (
            <Checkbox
              status={entry.habitDone ? 'checked' : 'unchecked'}
              onPress={() => onHabitToggle?.(!entry.habitDone)}
              color={accentColor}
            />
          ) : (
            <Text style={styles.typeIcon}>{TYPE_ICONS[entry.type]}</Text>
          )}
          <View style={styles.titleBlock}>
            <Text
              style={[styles.title, entry.status === 'completed' && styles.strikethrough]}
              numberOfLines={2}
            >
              {entry.title}
            </Text>
            {!!entry.description && (
              <Text style={styles.desc} numberOfLines={1}>
                {entry.description}
              </Text>
            )}
          </View>
        </View>

        {(entry.categories.length > 0 || entry.status) && (
          <View style={styles.footer}>
            <View style={styles.badges}>
              {entry.categories.slice(0, 3).map((cat) => (
                <CategoryBadge key={cat.id} category={cat} />
              ))}
              {entry.categories.length > 3 && (
                <Text style={styles.more}>+{entry.categories.length - 3}</Text>
              )}
            </View>
            {entry.status && (
              <StatusPill status={entry.status} onPress={onStatusChange} compact />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  typeIcon: { fontSize: 18, marginTop: 1 },
  titleBlock: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '500', color: '#212121' },
  strikethrough: { textDecorationLine: 'line-through', color: '#9E9E9E' },
  desc: { fontSize: 13, color: '#757575' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  more: { fontSize: 11, color: '#9E9E9E', marginLeft: 4 },
});
