import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import type { AnalyticsStackParamList } from './types';
import { AnalyticsScreen } from '@screens/Analytics/AnalyticsScreen';
import { ReportDetailScreen } from '@screens/Analytics/ReportDetailScreen';
import { CategoryDetailScreen } from '@screens/Analytics/CategoryDetailScreen';

const Stack = createStackNavigator<AnalyticsStackParamList>();

export function AnalyticsStack() {
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
      <Stack.Screen name="AnalyticsOverview" component={AnalyticsScreen} options={{ title: 'Analíticas' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Reporte' }} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={{ title: 'Categoría' }} />
    </Stack.Navigator>
  );
}
