import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Match, Message } from '../types';
import { Colors, gradientPink } from '../components/ui/Colors';
import { GradientButton } from '../components/ui/GradientButton';

// ── Call Modal ──────────────────────────────────────────────────────────────
function CallModal({
  type, match, onEnd,
}: {
  type: 'audio' | 'video';
  match: Match;
  onEnd: () => void;
}) {
  const { currentUser } = useApp();
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setDuration((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen">
      <LinearGradient colors={['#120625', '#050208']} style={call.container}>
        <Text style={call.label}>
          Fiffy Secure {type === 'video' ? 'Video' : 'Audio'} Call
        </Text>
        <Text style={call.timer}>{fmt(duration)}</Text>

        {type === 'video' && !videoOff ? (
          <View style={call.videoBox}>
            <Image source={{ uri: match.user.photos[0] }} style={call.videoImg} resizeMode="cover" />
            <View style={call.pip}>
              <Image source={{ uri: currentUser.photos[0] }} style={call.pipImg} resizeMode="cover" />
            </View>
          </View>
        ) : (
          <View style={call.audioBox}>
            <LinearGradient colors={gradientPink} style={call.audioRing}>
              <Image source={{ uri: match.user.photos[0] }} style={call.audioAvatar} resizeMode="cover" />
            </LinearGradient>
          </View>
        )}

        <Text style={call.name}>{match.user.name}</Text>
        <Text style={call.status}>Connected · Encrypted 🔒</Text>

        <View style={call.controls}>
          <TouchableOpacity
            style={[call.ctrlBtn, muted && call.ctrlBtnOn]}
            onPress={() => setMuted(!muted)}
          >
            <Text style={call.ctrlIcon}>{muted ? '🔇' : '🎤'}</Text>
          </TouchableOpacity>

          {type === 'video' && (
            <TouchableOpacity
              style={[call.ctrlBtn, videoOff && call.ctrlBtnOn]}
              onPress={() => setVideoOff(!videoOff)}
            >
              <Text style={call.ctrlIcon}>{videoOff ? '📵' : '📹'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={call.endBtn} onPress={onEnd}>
            <Text style={{ color: Colors.white, fontSize: 22 }}>📵</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

// ── Conversation View ───────────────────────────────────────────────────────
function ConversationView({ match, onBack }: { match: Match; onBack: () => void }) {
  const {
    messages, sendMessage, isPartnerTyping,
    unmatchUser, blockUser, setSafetyModalOpen,
    setInspectedProfile, currentUser, setMonetizationOpen, showToast,
  } = useApp();
  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const listRef = useRef<FlatList>(null);

  const msgs = messages[match.id] ?? [];

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs, isPartnerTyping]);

  const handleCall = (type: 'audio' | 'video') => {
    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast('VIP Feature', 'Voice & video calls require VIP upgrade.', 'info');
      return;
    }
    setCallType(type);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(match.id, text.trim());
    setText('');
  };

  const starters = [
    `Hey ${match.user.name}! Loved your answer about "${match.user.prompts[0]?.question || 'your interests'}" 😊`,
    'If we had 24 hours anywhere in Africa, where are we landing?',
    'What song have you had on repeat this week?',
  ];

  const renderMsg = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[cv.msgRow, isMe ? cv.msgRowMe : cv.msgRowThem]}>
        <View style={isMe ? cv.bubbleMe : cv.bubbleThem}>
          {isMe ? (
            <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cv.bubbleGrad}>
              <Text style={cv.msgTextMe}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <Text style={cv.msgTextThem}>{item.text}</Text>
          )}
        </View>
        <Text style={cv.ts}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <View style={cv.container}>
      {/* Header */}
      <View style={cv.header}>
        <TouchableOpacity onPress={onBack} style={cv.backBtn}>
          <Text style={cv.backIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cv.headerInfo}
          onPress={() => setInspectedProfile(match.user)}
          activeOpacity={0.7}
        >
          <View style={cv.avatarWrap}>
            <Image source={{ uri: match.user.photos[0] }} style={cv.avatar} />
            {match.user.online && <View style={cv.onlineDot} />}
          </View>
          <View>
            <Text style={cv.headerName}>{match.user.name}, {match.user.age}</Text>
            <Text style={cv.headerStatus}>
              {isPartnerTyping ? '✍ typing...' : match.user.online ? 'Active now' : match.user.lastActive}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={cv.headerActions}>
          <TouchableOpacity style={cv.iconBtn} onPress={() => handleCall('audio')}>
            <Text style={cv.iconBtnTxt}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cv.iconBtn} onPress={() => handleCall('video')}>
            <Text style={cv.iconBtnTxt}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cv.iconBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={cv.iconBtnTxt}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Options dropdown */}
      {menuOpen && (
        <View style={cv.menu}>
          <TouchableOpacity style={cv.menuItem} onPress={() => { setInspectedProfile(match.user); setMenuOpen(false); }}>
            <Text style={cv.menuText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cv.menuItem} onPress={() => { setSafetyModalOpen(true); setMenuOpen(false); }}>
            <Text style={[cv.menuText, { color: Colors.emerald }]}>🛡 Safety Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cv.menuItem} onPress={() => { unmatchUser(match.id); setMenuOpen(false); }}>
            <Text style={[cv.menuText, { color: Colors.purpleText }]}>Unmatch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cv.menuItem} onPress={() => { blockUser(match.user.id); setMenuOpen(false); }}>
            <Text style={[cv.menuText, { color: Colors.rose }]}>Block / Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={cv.msgList}
        ListHeaderComponent={
          <View style={cv.matchNotice}>
            <Text style={cv.matchNoticeTxt}>
              You matched with {match.user.name}! 🎉
            </Text>
            <Text style={cv.matchNoticeQuote} numberOfLines={2}>
              "{match.user.prompts[0]?.answer || match.user.bio}"
            </Text>
          </View>
        }
        ListFooterComponent={
          isPartnerTyping ? (
            <View style={cv.typingBubble}>
              <Text style={cv.typingDots}>● ● ●</Text>
            </View>
          ) : null
        }
      />

      {/* Input area */}
      {isFreeTier ? (
        <View style={cv.freeLock}>
          <Text style={cv.freeLockTitle}>💬 Messaging Requires VIP</Text>
          <Text style={cv.freeLockSub}>Upgrade to send messages to {match.user.name}</Text>
          <GradientButton title="Upgrade to Chat" onPress={() => setMonetizationOpen(true)} style={{ marginTop: 10 }} small />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Icebreaker chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={cv.starterScroll}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6, gap: 6, alignItems: 'center' }}
          >
            {starters.map((s, i) => (
              <TouchableOpacity key={i} style={cv.starterChip} onPress={() => setText(s)}>
                <Text style={cv.starterText} numberOfLines={1}>"{s.slice(0, 28)}…"</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={cv.inputBar}>
            <TextInput
              style={cv.input}
              value={text}
              onChangeText={setText}
              placeholder={`Message ${match.user.name}...`}
              placeholderTextColor={Colors.purpleDim}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[cv.sendBtn, !text.trim() && cv.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cv.sendGrad}>
                <Text style={cv.sendIcon}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {callType && (
        <CallModal type={callType} match={match} onEnd={() => setCallType(null)} />
      )}
    </View>
  );
}

// ── Main Chat Screen ────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { matches, activeChatMatchId, setActiveChatMatchId, activeChatMatch, currentUser, setMonetizationOpen } = useApp();
  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  if (activeChatMatchId && activeChatMatch) {
    return (
      <LinearGradient colors={['#0e0520', '#050208']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ConversationView match={activeChatMatch} onBack={() => setActiveChatMatchId(null)} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a0b2e', '#050208']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Free tier banner */}
        {isFreeTier && (
          <View style={ch.freeBanner}>
            <Text style={ch.freeBannerText}>🔒 Messaging requires VIP</Text>
            <TouchableOpacity onPress={() => setMonetizationOpen(true)}>
              <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ch.upgradeBtn}>
                <Text style={ch.upgradeBtnText}>Upgrade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={ch.listHeader}>
          <Text style={ch.listTitle}>Sparks & Messages</Text>
          <Text style={ch.listSub}>{matches.length} active connections</Text>
        </View>

        {/* New matches strip */}
        <Text style={ch.sectionLabel}>New Matches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ch.matchStrip}
          style={{ maxHeight: 90, borderBottomWidth: 1, borderBottomColor: Colors.border }}
        >
          {matches.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={ch.stripItem}
              onPress={() => setActiveChatMatchId(m.id)}
            >
              <View style={ch.stripAvatarWrap}>
                <Image source={{ uri: m.user.photos[0] }} style={ch.stripAvatar} />
                {m.user.online && <View style={ch.stripOnline} />}
              </View>
              <Text style={ch.stripName} numberOfLines={1}>{m.user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Conversations list */}
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[ch.convoRow, activeChatMatchId === item.id && ch.convoRowActive]}
              onPress={() => setActiveChatMatchId(item.id)}
              activeOpacity={0.75}
            >
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: item.user.photos[0] }} style={ch.convoAvatar} />
                {item.user.online && <View style={ch.convoOnline} />}
              </View>
              <View style={ch.convoInfo}>
                <View style={ch.convoInfoTop}>
                  <Text style={ch.convoName}>{item.user.name}</Text>
                  <Text style={ch.convoTime}>{item.lastMessageTime || item.matchedAt}</Text>
                </View>
                <Text style={ch.convoMsg} numberOfLines={1}>
                  {item.lastMessage || 'Connected! Say hello ✨'}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <LinearGradient colors={gradientPink} style={ch.unreadBadge}>
                  <Text style={ch.unreadText}>{item.unreadCount}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={ch.empty}>
              <Text style={ch.emptyIcon}>✨</Text>
              <Text style={ch.emptyTitle}>No matches yet</Text>
              <Text style={ch.emptySub}>Start swiping to find your spark!</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const ch = StyleSheet.create({
  freeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 12, padding: 12, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)', backgroundColor: 'rgba(255,42,133,0.07)',
  },
  freeBannerText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600', flex: 1 },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  upgradeBtnText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  listHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  listTitle: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  listSub: { color: Colors.purpleDim, fontSize: 12, marginTop: 2 },
  sectionLabel: { color: Colors.pinkLight, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
  matchStrip: { paddingHorizontal: 12, paddingVertical: 8, gap: 12, alignItems: 'center' },
  stripItem: { alignItems: 'center', width: 60 },
  stripAvatarWrap: { position: 'relative' },
  stripAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.pinkLight },
  stripOnline: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.emerald, borderWidth: 2, borderColor: '#0e061d' },
  stripName: { color: Colors.purpleText, fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  convoRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 12,
  },
  convoRowActive: { backgroundColor: 'rgba(236,72,153,0.08)', borderLeftWidth: 3, borderLeftColor: Colors.pinkLight },
  convoAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  convoOnline: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 5.5, backgroundColor: Colors.emerald, borderWidth: 2, borderColor: '#0e061d' },
  convoInfo: { flex: 1 },
  convoInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convoName: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  convoTime: { color: Colors.purpleDim, fontSize: 10 },
  convoMsg: { color: Colors.purpleText, fontSize: 12, marginTop: 3 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: Colors.purpleText, fontSize: 13 },
});

const cv = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
    backgroundColor: 'rgba(14,6,29,0.85)',
  },
  backBtn: { padding: 8 },
  backIcon: { color: Colors.purpleText, fontSize: 26, fontWeight: '300' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.pinkLight },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.emerald, borderWidth: 1.5, borderColor: '#080210' },
  headerName: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  headerStatus: { color: Colors.purpleDim, fontSize: 11 },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnTxt: { fontSize: 15 },
  menu: {
    position: 'absolute', top: 62, right: 12, zIndex: 50,
    backgroundColor: 'rgba(20,8,40,0.97)', borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 4, minWidth: 180,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 10,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuText: { color: Colors.purpleText, fontSize: 13, fontWeight: '600' },
  msgList: { padding: 16, gap: 10, paddingBottom: 20 },
  matchNotice: {
    backgroundColor: 'rgba(20,8,40,0.8)', borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginBottom: 12, alignItems: 'center',
  },
  matchNoticeTxt: { color: Colors.pinkLight, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  matchNoticeQuote: { color: Colors.purpleText, fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
  msgRow: { marginBottom: 8 },
  msgRowMe: { alignItems: 'flex-end' },
  msgRowThem: { alignItems: 'flex-start' },
  bubbleMe: { maxWidth: '80%', borderRadius: 18, borderBottomRightRadius: 4, overflow: 'hidden' },
  bubbleThem: {
    maxWidth: '80%', backgroundColor: 'rgba(26,14,48,0.85)',
    borderRadius: 18, borderBottomLeftRadius: 4, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  bubbleGrad: { padding: 12 },
  msgTextMe: { color: Colors.white, fontSize: 13, lineHeight: 18 },
  msgTextThem: { color: Colors.purpleText, fontSize: 13, lineHeight: 18 },
  ts: { color: Colors.purpleDim, fontSize: 9, marginTop: 3, marginHorizontal: 4 },
  typingBubble: {
    backgroundColor: 'rgba(26,14,48,0.85)', borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.border, marginTop: 4,
  },
  typingDots: { color: Colors.pinkLight, fontSize: 16, letterSpacing: 2 },
  freeLock: {
    padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(236,72,153,0.25)',
    backgroundColor: 'rgba(14,6,29,0.95)', alignItems: 'center',
  },
  freeLockTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  freeLockSub: { color: Colors.purpleText, fontSize: 12, textAlign: 'center' },
  starterScroll: { borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: 'rgba(14,6,29,0.85)', maxHeight: 44 },
  starterChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(22,9,45,0.8)', borderWidth: 1, borderColor: Colors.border,
  },
  starterText: { color: Colors.pinkLight, fontSize: 11 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12, backgroundColor: 'rgba(14,6,29,0.9)', borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(21,9,42,0.8)', borderRadius: 18,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.white, fontSize: 13, maxHeight: 100,
  },
  sendBtn: { borderRadius: 20, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendGrad: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  sendIcon: { color: Colors.white, fontSize: 16 },
});

const call = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 24 },
  label: { color: Colors.pinkLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  timer: { color: Colors.purpleText, fontSize: 14 },
  videoBox: { width: 280, height: 280, borderRadius: 28, overflow: 'hidden', position: 'relative' },
  videoImg: { width: '100%', height: '100%' },
  pip: { position: 'absolute', bottom: 10, right: 10, width: 70, height: 88, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: Colors.white },
  pipImg: { width: '100%', height: '100%' },
  audioBox: { alignItems: 'center' },
  audioRing: { width: 160, height: 160, borderRadius: 80, padding: 6, alignItems: 'center', justifyContent: 'center' },
  audioAvatar: { width: 148, height: 148, borderRadius: 74 },
  name: { color: Colors.white, fontSize: 26, fontWeight: '900', marginTop: 12 },
  status: { color: Colors.emerald, fontSize: 13, fontWeight: '600', marginTop: 4 },
  controls: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  ctrlBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlBtnOn: { backgroundColor: 'rgba(244,63,94,0.25)', borderColor: Colors.rose },
  ctrlIcon: { fontSize: 22 },
  endBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.rose, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.rose, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8,
  },
});
