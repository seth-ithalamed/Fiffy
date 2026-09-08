import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FCMNotificationPayload } from '../../types';
import { fcmService } from '../../services/fcmService';
import { Colors, gradientPink } from './Colors';
import { useApp } from '../../context/AppContext';

export const FCMAlertBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { setActiveChatMatchId, setInAppTab, matches } = useApp();
  const [activeNotification, setActiveNotification] = useState<FCMNotificationPayload | null>(null);

  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for FCM push alerts dispatched in-app
    const unsubscribe = fcmService.addListener((notification) => {
      showAlert(notification);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showAlert = (notification: FCMNotificationPayload) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveNotification(notification);

    // Animate slide down
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
        speed: 14,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 5.5s
    timerRef.current = setTimeout(() => {
      dismissAlert();
    }, 5500);
  };

  const dismissAlert = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveNotification(null);
    });
  };

  // Drag up gesture to dismiss quickly
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -25) {
          dismissAlert();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!activeNotification) return null;

  const handlePress = () => {
    const data = activeNotification.data;
    if (data?.matchId) {
      setActiveChatMatchId(data.matchId);
      setInAppTab('chat');
    } else if (activeNotification.type === 'new_match') {
      setInAppTab('chat');
    }
    dismissAlert();
  };

  const getChannelBadge = () => {
    switch (activeNotification.channelId) {
      case 'fiffy_sparks':
        return { label: 'FCM • SPARKS & MATCHES', color: Colors.pink, icon: '🔥' };
      case 'fiffy_messages':
        return { label: 'FCM • DIRECT CHAT', color: Colors.purple, icon: '💬' };
      case 'fiffy_safety':
        return { label: 'FCM • SAFETY GUARDIAN', color: Colors.amber, icon: '🛡️' };
      case 'fiffy_system':
      default:
        return { label: 'FCM • PLATFORM ALERT', color: Colors.sky, icon: '⚡' };
    }
  };

  const badge = getChannelBadge();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 14) + 6,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={styles.card}
      >
        <LinearGradient
          colors={['#1c0b32', '#0f051e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Header row: Channel Badge & timestamp */}
          <View style={styles.headerRow}>
            <View style={[styles.badge, { borderColor: badge.color }]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.timeText}>Just now</Text>
              <TouchableOpacity
                onPress={dismissAlert}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body row: Avatar + Title & Message */}
          <View style={styles.contentRow}>
            {activeNotification.avatarUrl ? (
              <Image
                source={{ uri: activeNotification.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderColor: badge.color }]}>
                <Text style={styles.avatarEmoji}>{badge.icon}</Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {activeNotification.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {activeNotification.body}
              </Text>
            </View>
          </View>

          {/* Quick Action Footer */}
          {activeNotification.actionLabel && (
            <View style={styles.footerRow}>
              <Text style={styles.tapToOpen}>Tap to open</Text>
              <View style={styles.actionBtn}>
                <LinearGradient
                  colors={gradientPink}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGrad}
                >
                  <Text style={styles.actionText}>{activeNotification.actionLabel}</Text>
                </LinearGradient>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
    pointerEvents: 'box-none',
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 133, 0.35)',
    shadowColor: '#ff2a85',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  cardGradient: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    color: Colors.purpleDim,
    fontWeight: '500',
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.purpleText,
    fontSize: 10,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  body: {
    color: Colors.purpleText,
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapToOpen: {
    fontSize: 11,
    color: Colors.purpleDim,
    fontWeight: '500',
  },
  actionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGrad: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  actionText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
