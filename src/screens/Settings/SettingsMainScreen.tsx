import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { SettingsStackParamList } from '@navigation/types';

type Props = StackScreenProps<SettingsStackParamList, 'SettingsMain'>;

export function SettingsMainScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Personalización</List.Subheader>
          <List.Item
            title="Categorías"
            description="Gestionar categorías y palabras clave"
            left={(props) => <List.Icon {...props} icon="tag-multiple-outline" />}
            onPress={() => navigation.navigate('Categories')}
          />
          <Divider />
          <List.Item
            title="Mis hábitos"
            description="Configurar hábitos a monitorear"
            left={(props) => <List.Icon {...props} icon="check-circle-outline" />}
            onPress={() => navigation.navigate('HabitsConfig')}
          />
          <Divider />
          <List.Item
            title="Apariencia"
            description="Tema, colores y fuente"
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
            onPress={() => navigation.navigate('ThemeSettings')}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
