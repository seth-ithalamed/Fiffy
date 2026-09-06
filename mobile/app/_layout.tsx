import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" backgroundColor="#05020a" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#05020a' } }} />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
