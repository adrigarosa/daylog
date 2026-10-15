import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { CategoryRow } from '@db/schema';

interface Props {
  category: CategoryRow;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: Props) {
  const isMd = size === 'md';
  return (
    <View style={[styles.badge, { backgroundColor: category.color + '22', borderColor: category.color + '66' }]}>
      {isMd && <Text style={styles.icon}>{category.icon}</Text>}
      <Text style={[styles.label, { color: category.color }, isMd && styles.labelMd]}>
        {isMd ? category.name : `${category.icon} ${category.name}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  icon: { fontSize: 11 },
  label: { fontSize: 11, fontWeight: '500' },
  labelMd: { fontSize: 13 },
});
