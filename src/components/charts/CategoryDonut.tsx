import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PieChart } from 'react-native-gifted-charts';
import type { CategoryRow } from '@db/schema';

interface DataPoint {
  categoryId: string;
  count: number;
}

interface Props {
  data: DataPoint[];
  categories: CategoryRow[];
  total: number;
  onPressCategory?: (categoryId: string) => void;
}

export function CategoryDonut({ data, categories, total, onPressCategory }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState<string | null>(null);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const pieData = data.slice(0, 8).map((item) => {
    const cat = catMap.get(item.categoryId);
    return {
      value: item.count,
      color: cat?.color ?? '#9E9E9E',
      categoryId: item.categoryId,
      focused: focused === item.categoryId,
    };
  });

  const focusedCat = focused ? catMap.get(focused) : null;
  const focusedCount = focused ? data.find((d) => d.categoryId === focused)?.count ?? 0 : total;
  const focusedPct = total > 0 ? Math.round((focusedCount / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={58}
          showText={false}
          onPress={(item: any) => {
            const id = item.categoryId as string;
            setFocused((prev) => (prev === id ? null : id));
            onPressCategory?.(id);
          }}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={[styles.centerPct, { color: theme.colors.onSurface }]}>
                {focusedCat ? `${focusedPct}%` : `${total}`}
              </Text>
              <Text style={[styles.centerLabel, { color: theme.colors.onSurfaceVariant }]}>
                {focusedCat ? focusedCat.name : 'entradas'}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data.slice(0, 8).map((item) => {
          const cat = catMap.get(item.categoryId);
          if (!cat) return null;
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const isActive = !focused || focused === item.categoryId;
          return (
            <TouchableOpacity
              key={item.categoryId}
              style={[styles.legendItem, !isActive && styles.legendDimmed]}
              onPress={() => {
                setFocused((prev) => (prev === item.categoryId ? null : item.categoryId));
                onPressCategory?.(item.categoryId);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
              <Text style={{ fontSize: 11 }}>{cat.icon}</Text>
              <Text style={[styles.legendName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={[styles.legendCount, { color: theme.colors.onSurfaceVariant }]}>
                {item.count} ({pct}%)
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  chartWrapper: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerPct: { fontSize: 22, fontWeight: '700' },
  centerLabel: { fontSize: 11 },
  legend: { width: '100%', gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  legendDimmed: { opacity: 0.35 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13 },
  legendCount: { fontSize: 12 },
});
