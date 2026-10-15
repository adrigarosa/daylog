import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import type { SettingsStackParamList } from './types';
import { SettingsMainScreen } from '@screens/Settings/SettingsMainScreen';
import { CategoriesScreen } from '@screens/Settings/CategoriesScreen';
import { CategoryDetailScreen } from '@screens/Settings/CategoryDetailScreen';
import { KeywordsScreen } from '@screens/Settings/KeywordsScreen';
import { HabitsConfigScreen } from '@screens/Settings/HabitsConfigScreen';
import { HabitDetailScreen } from '@screens/Settings/HabitDetailScreen';
import { ThemeSettingsScreen } from '@screens/Settings/ThemeSettingsScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '600' },
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsMainScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categorías' }} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={{ title: 'Categoría' }} />
      <Stack.Screen name="Keywords" component={KeywordsScreen} options={{ title: 'Palabras clave' }} />
      <Stack.Screen name="HabitsConfig" component={HabitsConfigScreen} options={{ title: 'Mis hábitos' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Hábito' }} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ title: 'Apariencia' }} />
    </Stack.Navigator>
  );
}
