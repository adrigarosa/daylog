import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDayLabel, addDays, isFuture } from '@utils/dateUtils';

interface Props {
  date: string;
  onDateChange: (newDate: string) => void;
}

export function DateNavigator({ date, onDateChange }: Props) {
  const theme = useTheme();
  const canGoNext = !isFuture(addDays(date, 1));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
      <TouchableOpacity onPress={() => onDateChange(addDays(date, -1))} style={styles.arrow} hitSlop={8}>
        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.primary} />
      </TouchableOpacity>

      <Text
        variant="titleMedium"
        style={[styles.label, { color: theme.colors.onSurface }]}
        numberOfLines={1}
      >
        {formatDayLabel(date)}
      </Text>

      <TouchableOpacity
        onPress={canGoNext ? () => onDateChange(addDays(date, 1)) : undefined}
        style={styles.arrow}
        hitSlop={8}
        disabled={!canGoNext}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={28}
          color={canGoNext ? theme.colors.primary : theme.colors.outline}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  arrow: { padding: 4 },
  label: { flex: 1, textAlign: 'center', fontWeight: '600', textTransform: 'capitalize' },
});
