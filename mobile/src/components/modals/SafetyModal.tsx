import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from '../ui/Colors';

export function SafetyModal() {
  const { isSafetyModalOpen, setSafetyModalOpen, activeChatMatch } = useApp();

  return (
    <Modal visible={isSafetyModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSafetyModalOpen(false)}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>🛡  Date Safety Check-in</Text>
          <TouchableOpacity onPress={() => setSafetyModalOpen(false)} style={s.closeBtn}>
            <Text style={s.closeTxt}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.body}>
          <Text style={s.intro}>
            Your safety is our highest priority. Use these tools before, during, and after meeting {activeChatMatch?.user.name || 'your match'} in person.
          </Text>

          {[
            {
              icon: '📍',
              title: 'Share Your Location',
              body: 'Before meeting, share your location with a trusted friend or family member via your phone\'s native share feature.',
              action: null,
            },
            {
              icon: '🆘',
              title: 'Emergency Services',
              body: 'In immediate danger? Call emergency services in your country right away.',
              action: { label: 'Call 911 / 10111', fn: () => Linking.openURL('tel:10111') },
            },
            {
              icon: '📞',
              title: 'Tell a Friend',
              body: 'Let someone you trust know where you are going, who you are meeting, and when you expect to be back.',
              action: null,
            },
            {
              icon: '🏠',
              title: 'Meet in Public First',
              body: 'Always meet for the first few dates in busy, well-lit public spaces like cafes, restaurants, or shopping centres.',
              action: null,
            },
            {
              icon: '🚗',
              title: 'Arrange Your Own Transport',
              body: 'Drive yourself or arrange your own transport to and from the date. Never depend on your date for your only way home.',
              action: null,
            },
            {
              icon: '🔇',
              title: 'Trust Your Instincts',
              body: 'If something feels wrong, it probably is. Leave immediately and contact someone you trust.',
              action: null,
            },
          ].map((tip, i) => (
            <View key={i} style={s.tipCard}>
              <Text style={s.tipIcon}>{tip.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.tipTitle}>{tip.title}</Text>
                <Text style={s.tipBody}>{tip.body}</Text>
                {tip.action && (
                  <TouchableOpacity onPress={tip.action.fn} style={s.actionBtn}>
                    <Text style={s.actionBtnText}>{tip.action.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <View style={s.panicCard}>
            <Text style={s.panicTitle}>🆘 Safety Emergency Line</Text>
            <Text style={s.panicBody}>
              If you feel unsafe or threatened at any time, call your local emergency services immediately. Your safety always comes first.
            </Text>
            <TouchableOpacity
              style={s.panicBtn}
              onPress={() => Linking.openURL('tel:10111')}
            >
              <Text style={s.panicBtnText}>📞  Call Emergency Services</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0620' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  closeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  closeTxt: { color: Colors.emerald, fontSize: 13, fontWeight: '700' },
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  intro: { color: Colors.purpleText, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  tipCard: {
    flexDirection: 'row', gap: 14, padding: 16, borderRadius: 18,
    backgroundColor: 'rgba(22,9,45,0.8)', borderWidth: 1, borderColor: Colors.border,
  },
  tipIcon: { fontSize: 22, marginTop: 2 },
  tipTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  tipBody: { color: Colors.purpleText, fontSize: 12, lineHeight: 18 },
  actionBtn: { marginTop: 8, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  actionBtnText: { color: Colors.emerald, fontSize: 12, fontWeight: '700' },
  panicCard: {
    backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)', padding: 18, gap: 10, marginTop: 8,
  },
  panicTitle: { color: Colors.white, fontSize: 15, fontWeight: '900' },
  panicBody: { color: Colors.purpleText, fontSize: 12, lineHeight: 18 },
  panicBtn: {
    backgroundColor: Colors.rose, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.rose, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 6,
  },
  panicBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
});
