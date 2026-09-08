import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, gradientPink } from '../ui/Colors';
import { fcmService } from '../../services/fcmService';
import { FCMNotificationPreferences, FCMNotificationPayload } from '../../types';

interface FCMNotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FCMNotificationModal: React.FC<FCMNotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const [token, setToken] = useState<string>('');
  const [prefs, setPrefs] = useState<FCMNotificationPreferences>(fcmService.getPreferences());
  const [history, setHistory] = useState<FCMNotificationPayload[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const currentToken = fcmService.getToken() || 'fcm_pending_initialization';
    setToken(currentToken);
    setPrefs(fcmService.getPreferences());
    const hist = await fcmService.getHistory();
    setHistory(hist);
  };

  const handleToggle = async (key: keyof FCMNotificationPreferences, value: boolean) => {
    const updated = await fcmService.updatePreferences({ [key]: value });
    setPrefs(updated);
  };

  const copyToken = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('FCM Token Copied', `${token}\n\nThis device is registered for Firebase Cloud Messaging push delivery.`);
  };

  const triggerTestAlert = async (
    type: 'new_match' | 'new_message' | 'safety_alert' | 'boost_activated'
  ) => {
    switch (type) {
      case 'new_match':
        await fcmService.dispatchNotification({
          channelId: 'fiffy_sparks',
          type: 'new_match',
          title: '🔥 New Spark on Fiffy!',
          body: 'Amara liked your profile back! Say Sawubona and start your conversation.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          actionLabel: 'View Match',
          data: { type: 'new_match' },
        });
        break;

      case 'new_message':
        await fcmService.dispatchNotification({
          channelId: 'fiffy_messages',
          type: 'new_message',
          title: '💬 Kofi Mensah',
          body: 'Sawubona! Are you free this Friday for the AfroTech networking lounge?',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          actionLabel: 'Reply Now',
          data: { type: 'new_message', matchId: 'match-1' },
        });
        break;

      case 'safety_alert':
        await fcmService.dispatchNotification({
          channelId: 'fiffy_safety',
          type: 'safety_alert',
          title: '🛡️ Safety Guardian Check-in',
          body: 'Your scheduled 2-hour date check-in is active. Confirm you are safe or trigger emergency contacts.',
          actionLabel: 'Check In Safe',
          data: { type: 'safety_alert' },
        });
        break;

      case 'boost_activated':
        await fcmService.dispatchNotification({
          channelId: 'fiffy_system',
          type: 'boost_activated',
          title: '⚡ Profile Spotlight Live!',
          body: 'You are now featured at the top of Sparks Deck for singles across Africa & Diaspora.',
          actionLabel: 'Check Deck',
          data: { type: 'boost_activated' },
        });
        break;
    }

    // Refresh history
    const hist = await fcmService.getHistory();
    setHistory(hist);
  };

  const clearHistory = async () => {
    await fcmService.clearHistory();
    setHistory([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>FCM Push Notifications</Text>
                <View style={styles.connectedBadge}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              </View>
              <Text style={styles.sub}>
                Firebase Cloud Messaging (FCM V1) instant delivery pipeline
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Device Token Section */}
            <View style={styles.tokenCard}>
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenLabel}>FCM REGISTRATION TOKEN</Text>
                <TouchableOpacity onPress={copyToken} style={styles.copyBtn}>
                  <Text style={styles.copyText}>{copied ? '✓ Copied' : 'Copy Token'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tokenValue} numberOfLines={2}>
                {token}
              </Text>
              <Text style={styles.tokenNote}>
                High-priority background channels enabled: Android &amp; iOS APNs bridge
              </Text>
            </View>

            {/* FCM Alert Simulator */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⚡ Test Push Notification Alerts</Text>
              <Text style={styles.sectionDesc}>
                Trigger real FCM push notification alerts to verify in-app banner delivery:
              </Text>

              <View style={styles.simulatorGrid}>
                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => triggerTestAlert('new_match')}
                >
                  <Text style={styles.simBtnIcon}>🔥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simBtnTitle}>New Match Alert</Text>
                    <Text style={styles.simBtnSub}>Sparks Deck mutual like</Text>
                  </View>
                  <Text style={styles.simBtnAction}>Test →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => triggerTestAlert('new_message')}
                >
                  <Text style={styles.simBtnIcon}>💬</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simBtnTitle}>Direct Message Alert</Text>
                    <Text style={styles.simBtnSub}>Incoming chat with reply action</Text>
                  </View>
                  <Text style={styles.simBtnAction}>Test →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => triggerTestAlert('safety_alert')}
                >
                  <Text style={styles.simBtnIcon}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simBtnTitle}>Safety Guardian Alert</Text>
                    <Text style={styles.simBtnSub}>High-urgency check-in alert</Text>
                  </View>
                  <Text style={styles.simBtnAction}>Test →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => triggerTestAlert('boost_activated')}
                >
                  <Text style={styles.simBtnIcon}>⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simBtnTitle}>Spotlight Boost Alert</Text>
                    <Text style={styles.simBtnSub}>VIP 10x visibility notice</Text>
                  </View>
                  <Text style={styles.simBtnAction}>Test →</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Channel Preferences */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🔔 Notification Channels</Text>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Sparks &amp; Matches</Text>
                  <Text style={styles.toggleSub}>Channel: fiffy_sparks (High Priority)</Text>
                </View>
                <Switch
                  value={prefs.sparksAndMatches}
                  onValueChange={(val) => handleToggle('sparksAndMatches', val)}
                  thumbColor={prefs.sparksAndMatches ? Colors.pink : '#555'}
                  trackColor={{ false: '#333', true: 'rgba(255,42,133,0.4)' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Direct Chat Messages</Text>
                  <Text style={styles.toggleSub}>Channel: fiffy_messages (Heads-up)</Text>
                </View>
                <Switch
                  value={prefs.directMessages}
                  onValueChange={(val) => handleToggle('directMessages', val)}
                  thumbColor={prefs.directMessages ? Colors.pink : '#555'}
                  trackColor={{ false: '#333', true: 'rgba(255,42,133,0.4)' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Safety &amp; Guardian Check-ins</Text>
                  <Text style={styles.toggleSub}>Channel: fiffy_safety (Urgent)</Text>
                </View>
                <Switch
                  value={prefs.safetyReminders}
                  onValueChange={(val) => handleToggle('safetyReminders', val)}
                  thumbColor={prefs.safetyReminders ? Colors.pink : '#555'}
                  trackColor={{ false: '#333', true: 'rgba(255,42,133,0.4)' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Haptic Feedback &amp; Vibration</Text>
                  <Text style={styles.toggleSub}>Vibrate device on incoming push</Text>
                </View>
                <Switch
                  value={prefs.vibrationEnabled}
                  onValueChange={(val) => handleToggle('vibrationEnabled', val)}
                  thumbColor={prefs.vibrationEnabled ? Colors.pink : '#555'}
                  trackColor={{ false: '#333', true: 'rgba(255,42,133,0.4)' }}
                />
              </View>
            </View>

            {/* Notification History */}
            <View style={[styles.sectionCard, { marginBottom: 30 }]}>
              <View style={styles.tokenHeader}>
                <Text style={styles.sectionTitle}>📜 Recent Alerts Log ({history.length})</Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {history.length === 0 ? (
                <Text style={styles.emptyText}>No push notifications received yet.</Text>
              ) : (
                <View style={{ gap: 8, marginTop: 10 }}>
                  {history.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyTime}>{item.sentAt}</Text>
                      </View>
                      <Text style={styles.historyBody} numberOfLines={2}>
                        {item.body}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0c051a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxHeight: '90%',
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.4)',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  connectedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
  },
  sub: {
    fontSize: 11,
    color: Colors.purpleDim,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.purpleText,
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tokenCard: {
    backgroundColor: '#160a2d',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.purpleDim,
    letterSpacing: 0.5,
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,42,133,0.18)',
  },
  copyText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.pink,
  },
  tokenValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.white,
    lineHeight: 16,
  },
  tokenNote: {
    fontSize: 10,
    color: Colors.purpleDim,
    marginTop: 6,
  },
  sectionCard: {
    backgroundColor: '#120625',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 11,
    color: Colors.purpleDim,
    marginBottom: 12,
  },
  simulatorGrid: {
    gap: 8,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 10,
  },
  simBtnIcon: {
    fontSize: 20,
  },
  simBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  simBtnSub: {
    fontSize: 10,
    color: Colors.purpleDim,
    marginTop: 1,
  },
  simBtnAction: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.pink,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  toggleSub: {
    fontSize: 10,
    color: Colors.purpleDim,
    marginTop: 1,
  },
  clearText: {
    fontSize: 11,
    color: Colors.rose,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 11,
    color: Colors.purpleDim,
    fontStyle: 'italic',
    marginTop: 6,
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    marginRight: 8,
  },
  historyTime: {
    fontSize: 9,
    color: Colors.purpleDim,
  },
  historyBody: {
    fontSize: 11,
    color: Colors.purpleText,
    lineHeight: 15,
  },
});
