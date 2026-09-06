import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Image,
  TextInput, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { Colors, gradientPink } from '../ui/Colors';

export function MatchCelebrationModal() {
  const {
    activeMatchCelebration, closeMatchCelebration,
    currentUser, sendMessage, matches,
    setActiveChatMatchId, setInAppTab,
  } = useApp();

  const [msgText, setMsgText] = useState('');

  if (!activeMatchCelebration) return null;

  const { user: matched } = activeMatchCelebration;
  const targetMatch = matches.find((m) => m.userId === matched.id);

  const starters = [
    `Hey ${matched.name}! Loved your answer about "${matched.prompts[0]?.question || 'your interests'}" 😊`,
    `Hi ${matched.name}! We both love ${matched.interests[0] || 'great music'}! What\'s your favourite spot?`,
    `Hey! Your profile gave me an instant spark. How is your week going? ✨`,
  ];

  const handleSend = (text: string) => {
    const content = text || msgText;
    if (targetMatch && content.trim()) {
      sendMessage(targetMatch.id, content.trim());
      setActiveChatMatchId(targetMatch.id);
      setInAppTab('chat');
    }
    closeMatchCelebration();
  };

  return (
    <Modal visible animationType="fade" transparent>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Glow bg */}
          <LinearGradient
            colors={['rgba(255,42,133,0.12)', 'transparent', 'rgba(168,85,247,0.1)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Tag */}
          <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.tag}>
            <Text style={s.tagText}>✦ Mutual Spark Connected!</Text>
          </LinearGradient>

          {/* Headline */}
          <Text style={s.headline}>It's a Match!</Text>
          <Text style={s.subLine}>
            You and <Text style={{ color: Colors.white, fontWeight: '800' }}>{matched.name}</Text> liked each other.
          </Text>

          {/* Avatars */}
          <View style={s.avatarRow}>
            <Image source={{ uri: currentUser.photos[0] }} style={s.avatarMe} />
            <LinearGradient colors={gradientPink} style={s.heartBadge}>
              <Text style={{ fontSize: 18 }}>♥</Text>
            </LinearGradient>
            <Image source={{ uri: matched.photos[0] }} style={s.avatarThem} />
          </View>

          {/* Icebreakers */}
          <Text style={s.sectionLabel}>Quick Conversation Starters</Text>
          {starters.slice(0, 2).map((st, i) => (
            <TouchableOpacity key={i} style={s.starterBtn} onPress={() => handleSend(st)}>
              <Text style={s.starterText}>"{st}"</Text>
            </TouchableOpacity>
          ))}

          {/* Custom message */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={msgText}
              onChangeText={setMsgText}
              placeholder={`Message ${matched.name}...`}
              placeholderTextColor={Colors.purpleDim}
              onSubmitEditing={() => handleSend(msgText)}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={() => handleSend(msgText)} style={s.sendBtn}>
              <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sendGrad}>
                <Text style={{ color: Colors.white, fontSize: 16 }}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Keep swiping */}
          <TouchableOpacity onPress={closeMatchCelebration} style={s.skipBtn}>
            <Text style={s.skipText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: 'rgba(18,6,37,0.97)',
    borderRadius: 28, borderWidth: 1, borderColor: 'rgba(236,72,153,0.4)',
    padding: 24, alignItems: 'center', gap: 12, overflow: 'hidden',
    shadowColor: Colors.pink, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12,
  },
  tag: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  tagText: { color: Colors.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  headline: {
    fontSize: 42, fontWeight: '900', letterSpacing: -1,
    color: Colors.pinkLight,
  },
  subLine: { color: Colors.purpleText, fontSize: 13, textAlign: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  avatarMe: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.purple },
  avatarThem: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.pinkLight },
  heartBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  sectionLabel: { color: Colors.purpleDim, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, alignSelf: 'flex-start' },
  starterBtn: {
    width: '100%', backgroundColor: 'rgba(24,8,48,0.8)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 12,
  },
  starterText: { color: Colors.purpleText, fontSize: 12, lineHeight: 17 },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  input: {
    flex: 1, backgroundColor: 'rgba(21,9,42,0.8)', borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10,
    color: Colors.white, fontSize: 13,
  },
  sendBtn: { borderRadius: 20, overflow: 'hidden' },
  sendGrad: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  skipBtn: {
    width: '100%', padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  skipText: { color: Colors.purpleText, fontSize: 13, fontWeight: '700' },
});
