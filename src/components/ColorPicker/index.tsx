import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#212121',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {PALETTE.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onChange(color)}
            style={[styles.swatch, { backgroundColor: color }]}
            activeOpacity={0.7}
          >
            {value === color && (
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customRow}>
        <View style={[styles.preview, { backgroundColor: value }]} />
        <TextInput
          label="Color hex"
          value={value}
          onChangeText={(t) => {
            const clean = t.startsWith('#') ? t : `#${t}`;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(clean)) onChange(clean);
          }}
          mode="outlined"
          style={styles.hexInput}
          maxLength={7}
          autoCapitalize="characters"
          placeholder="#6C63FF"
          dense
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preview: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#ccc' },
  hexInput: { flex: 1 },
});
