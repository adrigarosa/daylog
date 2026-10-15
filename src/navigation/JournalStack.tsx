import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import type { JournalStackParamList } from './types';
import { TodayScreen } from '@screens/Today/TodayScreen';
import { AddEditEntryScreen } from '@screens/Journal/AddEditEntryScreen';
import { EntryDetailScreen } from '@screens/Journal/EntryDetailScreen';

const Stack = createStackNavigator<JournalStackParamList>();

export function JournalStack() {
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
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: 'Hoy' }} />
      <Stack.Screen
        name="AddEditEntry"
        component={AddEditEntryScreen}
        options={({ route }) =>
          ({ title: route.params?.entryId ? 'Editar entrada' : 'Nueva entrada' })
        }
      />
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}
