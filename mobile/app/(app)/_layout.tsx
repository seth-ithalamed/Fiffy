import React from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../src/context/AppContext';
import { Colors, gradientPink } from '../../src/components/ui/Colors';
import { MatchCelebrationModal } from '../../src/components/modals/MatchCelebrationModal';
import { MonetizationModal } from '../../src/components/modals/MonetizationModal';
import { SafetyModal } from '../../src/components/modals/SafetyModal';
import { PaymentModal } from '../../src/components/modals/PaymentModal';
import { ToastStack } from '../../src/components/ui/Toast';

function TabIcon({ icon, label, focused, badge }: { icon: string; label: string; focused: boolean; badge?: number }) {
  return (
    <View style={ti.wrap}>
      {focused ? (
        <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ti.activeBg}>
          <Text style={ti.iconActive}>{icon}</Text>
        </LinearGradient>
      ) : (
        <View style={ti.inactiveBg}>
          <Text style={ti.icon}>{icon}</Text>
        </View>
      )}
      <Text style={[ti.label, focused && ti.labelActive]}>{label}</Text>
      {!!badge && badge > 0 && (
        <LinearGradient colors={gradientPink} style={ti.badge}>
          <Text style={ti.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

export default function AppLayout() {
  const { isLoggedIn, authLoading, matches } = useApp();
  const router = useRouter();

  // Guard: if somehow landed here without auth, push to auth
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/auth');
    }
  }, [isLoggedIn, authLoading]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#05020a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.pink, fontSize: 14, fontWeight: '700' }}>Loading Fiffy's...</Text>
      </View>
    );
  }

  const totalUnread = matches.reduce((a, m) => a + (m.unreadCount || 0), 0);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(9,4,18,0.97)',
            borderTopColor: 'rgba(255,255,255,0.08)',
            borderTopWidth: 1,
            height: 78,
            paddingBottom: 14,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🔥" label="Sparks" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="💬" label="Chat" focused={focused} badge={totalUnread} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👤" label="Profile" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Global modals rendered above tabs */}
      <MatchCelebrationModal />
      <MonetizationModal />
      <SafetyModal />
      <PaymentModal />
      <ToastStack />
    </>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
  activeBg: { width: 40, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inactiveBg: { width: 40, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  iconActive: { fontSize: 20 },
  label: { fontSize: 10, fontWeight: '600', color: Colors.purpleDim },
  labelActive: { color: Colors.white, fontWeight: '800' },
  badge: {
    position: 'absolute', top: -3, right: -8,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '900' },
});
