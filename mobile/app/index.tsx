import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { isLoggedIn, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      router.replace('/(app)');
    } else {
      router.replace('/auth');
    }
  }, [isLoggedIn, authLoading]);

  // Show spinner while AsyncStorage hydrates
  return (
    <View style={{ flex: 1, backgroundColor: '#05020a', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#ff2a85" size="large" />
    </View>
  );
}
