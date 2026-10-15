import React, { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

enableScreens();

const IS_WEB = Platform.OS === 'web';

function NativeAppContent() {
  const { db } = require('./src/db/database');   // migrations already ran on module init
  const { runSeed } = require('./src/db/seed');
  const { paperTheme } = useAppTheme();
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    runSeed(db)
      .then(() => setReady(true))
      .catch((e: unknown) => setInitError(String(e)));
  }, []);

  if (initError) {
    return (
      <View style={[styles.center, { backgroundColor: '#fff' }]}>
        <Text style={styles.errTitle}>Error al inicializar</Text>
        <Text style={styles.errDetail}>{initError}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Iniciando DayLog…
        </Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function WebAppContent() {
  const { paperTheme } = useAppTheme();
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          {IS_WEB ? <WebAppContent /> : <NativeAppContent />}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errTitle: { fontSize: 16, fontWeight: '700', color: '#B00020', marginBottom: 8, textAlign: 'center' },
  errDetail: { fontSize: 12, color: '#555', textAlign: 'center' },
});
