import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, RadioButton, List, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useAppTheme } from '@theme/ThemeContext';
import type { ThemeMode } from '@t/index';

const MODES: Array<{ label: string; value: ThemeMode }> = [
  { label: 'Sistema (automático)', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

export function ThemeSettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Tema de la aplicación</List.Subheader>
          {MODES.map((m) => (
            <React.Fragment key={m.value}>
              <List.Item
                title={m.label}
                onPress={() => setMode(m.value)}
                left={() => (
                  <View style={styles.radio}>
                    <RadioButton
                      value={m.value}
                      status={mode === m.value ? 'checked' : 'unchecked'}
                      onPress={() => setMode(m.value)}
                    />
                  </View>
                )}
              />
              <Divider />
            </React.Fragment>
          ))}
        </List.Section>
        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Más opciones de personalización disponibles en Fase 6.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  radio: { justifyContent: 'center', paddingLeft: 8 },
  note: { paddingHorizontal: 16, paddingVertical: 12 },
});
