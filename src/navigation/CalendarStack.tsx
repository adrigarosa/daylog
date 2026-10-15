import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import type { CalendarStackParamList } from './types';
import { CalendarScreen } from '@screens/Calendar/CalendarScreen';
import { DayDetailScreen } from '@screens/Calendar/DayDetailScreen';

const Stack = createStackNavigator<CalendarStackParamList>();

export function CalendarStack() {
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
      <Stack.Screen name="CalendarView" component={CalendarScreen} options={{ title: 'Calendario' }} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} options={{ title: 'Detalle del día' }} />
    </Stack.Navigator>
  );
}
