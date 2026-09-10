import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Colors, gradientPink } from '../components/ui/Colors';
import { GradientButton } from '../components/ui/GradientButton';
import {
  ALL_INTEREST_TAGS, PROMPT_QUESTIONS_CATALOG, AFRICAN_COUNTRIES,
} from '../data/mockData';
import { Gender, SexualOrientation, ChildrenStatus, CHILDREN_STATUS_CONFIG } from '../types';

// ── Selfie Verification Modal ─────────────────────────────────────────────
function SelfieModal({ photo, onClose }: { photo: string; onClose: () => void }) {
  const { verifySelfie } = useApp();
  const [count, setCount] = useState(3);

  React.useEffect(() => {
    if (count <= 0) return;
    const id = setTimeout(() => {
      setCount((p) => p - 1);
      if (count === 1) { verifySelfie(); onClose(); }
    }, 1000);
    return () => clearTimeout(id);
  }, [count]);

  return (
    <Modal visible animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={sv.card}>
          <View style={sv.countdown}><Text style={sv.countdownText}>{count > 0 ? count : '✓'}</Text></View>
          <Text style={sv.title}>Selfie Match Verification</Text>
          <Text style={sv.sub}>Generating biometric proof for your verified badge...</Text>
          <View style={sv.imgWrap}>
            <Image source={{ uri: photo }} style={sv.img} resizeMode="cover" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const {
    currentUser,
    updateCurrentUser,
    verifySelfie,
    logoutUser,
    authUser,
    showToast,
    setIsFcmModalOpen,
  } = useApp();
  const [selfieOpen, setSelfieOpen] = useState(false);

  const completeness = (() => {
    let s = 0;
    if (currentUser.name) s += 10;
    if (currentUser.photos.length >= 1) s += 20;
    if (currentUser.photos.length >= 3) s += 15;
    if (currentUser.bio && currentUser.bio.length > 20) s += 15;
    if (currentUser.prompts.length >= 2) s += 15;
    if (currentUser.interests.length >= 4) s += 15;
    if (currentUser.verified) s += 10;
    return Math.min(100, s);
  })();

  const samplePhotos = [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
  ];

  const addPhoto = () => {
    if (currentUser.photos.length >= 5) {
      showToast('Max Photos Reached', 'You can upload up to 5 photos.', 'info');
      return;
    }
    const avail = samplePhotos.filter((u) => !currentUser.photos.includes(u));
    if (avail.length > 0) {
      updateCurrentUser({ photos: [...currentUser.photos, avail[0]] });
    } else {
      showToast('Max Photos', 'You have already added all available photos.', 'info');
    }
  };

  const removePhoto = (idx: number) => {
    if (currentUser.photos.length <= 1) {
      showToast('Photo Required', 'At least 1 photo is required.', 'info');
      return;
    }
    updateCurrentUser({ photos: currentUser.photos.filter((_, i) => i !== idx) });
  };

  const updatePrompt = (idx: number, question: string, answer: string) => {
    const updated = [...currentUser.prompts];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], question, answer };
      updateCurrentUser({ prompts: updated });
    }
  };

  const toggleInterest = (tag: string) => {
    const updated = currentUser.interests.includes(tag)
      ? currentUser.interests.filter((t) => t !== tag)
      : [...currentUser.interests, tag];
    updateCurrentUser({ interests: updated });
  };

  return (
    <LinearGradient colors={['#1a0b2e', '#050208']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.sub}>Curate your photos, prompts, and privacy</Text>
            </View>
            {currentUser.verified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setSelfieOpen(true)} style={styles.verifyBtn}>
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verifyGrad}>
                  <Text style={styles.verifyText}>📷 Verify</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Completeness */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Profile Completeness: {completeness}%</Text>
              <Text style={styles.cardSub}>
                {completeness === 100 ? '🎉 All Set!' : '+2.4x sparks with prompts'}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={gradientPink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completeness}%` as any }]}
              />
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos ({currentUser.photos.length}/5)</Text>
              <Text style={styles.sectionSub}>First photo is your main card (Max 5)</Text>
            </View>
            <View style={styles.photoGrid}>
              {currentUser.photos.map((url, idx) => (
                <View key={idx} style={styles.photoSlot}>
                  <Image source={{ uri: url }} style={styles.photoImg} resizeMode="cover" />
                  {idx === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>Main</Text></View>}
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(idx)}>
                    <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {currentUser.photos.length < 5 && (
                <TouchableOpacity style={styles.addPhotoSlot} onPress={addPhoto}>
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Identity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💛 Gender & Preferences</Text>

            <Text style={styles.label}>My Gender</Text>
            <View style={styles.chipRow}>
              {(['woman', 'man', 'non-binary', 'genderfluid', 'agender', 'other'] as Gender[]).map((g) => (
                <TouchableOpacity key={g} style={[styles.chip, currentUser.gender === g && styles.chipActive]}
                  onPress={() => updateCurrentUser({ gender: g })}>
                  {currentUser.gender === g ? (
                    <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                      <Text style={styles.chipTextActive}>{g}</Text>
                    </LinearGradient>
                  ) : <Text style={styles.chipText}>{g}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Orientation</Text>
            <View style={styles.chipRow}>
              {(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer', 'asexual'] as SexualOrientation[]).map((o) => (
                <TouchableOpacity key={o} style={[styles.chip, currentUser.orientation === o && styles.chipActive]}
                  onPress={() => updateCurrentUser({ orientation: o })}>
                  {currentUser.orientation === o ? (
                    <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                      <Text style={styles.chipTextActive}>{o}</Text>
                    </LinearGradient>
                  ) : <Text style={styles.chipText}>{o}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Show Me</Text>
            <View style={styles.chipRow}>
              {(['everyone', 'women', 'men', 'non-binary'] as const).map((sm) => (
                <TouchableOpacity key={sm} style={[styles.chip, currentUser.showMe === sm && styles.chipActive]}
                  onPress={() => updateCurrentUser({ showMe: sm })}>
                  {currentUser.showMe === sm ? (
                    <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                      <Text style={styles.chipTextActive}>{sm}</Text>
                    </LinearGradient>
                  ) : <Text style={styles.chipText}>{sm}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Children / Family Status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👶 Children & Family Plans</Text>
            <Text style={styles.cardSub}>Important transparency for serious & cheating-free dating</Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {CHILDREN_STATUS_CONFIG.map((item) => {
                const isSelected = currentUser.childrenStatus === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardActive,
                    ]}
                    onPress={() => updateCurrentUser({ childrenStatus: item.value })}
                  >
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    <Text
                      style={[
                        { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.purpleText },
                        isSelected && { color: Colors.white, fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌍 Location & Match Preferences</Text>

            <Text style={styles.label}>My Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {AFRICAN_COUNTRIES.map((c) => {
                const sel = currentUser.country === c.name;
                return (
                  <TouchableOpacity key={c.code} style={[styles.chip, sel && styles.chipActive, { marginRight: 6 }]}
                    onPress={() => updateCurrentUser({ country: c.name, countryFlag: c.flag, countryCode: c.code })}>
                    {sel ? (
                      <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                        <Text style={styles.chipTextActive}>{c.flag} {c.name.split(' ')[0]}</Text>
                      </LinearGradient>
                    ) : <Text style={styles.chipText}>{c.flag} {c.name.split(' ')[0]}</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={currentUser.city}
              onChangeText={(v) => updateCurrentUser({ city: v, location: `${v}, ${currentUser.country}` })}
              placeholder="e.g. Sandton, Lagos..."
              placeholderTextColor={Colors.purpleDim}
            />
          </View>

          {/* Bio & lifestyle */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About You</Text>
            <TextInput
              style={[styles.input, { minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }]}
              value={currentUser.bio}
              onChangeText={(v) => updateCurrentUser({ bio: v })}
              placeholder="Tell others what you love doing..."
              placeholderTextColor={Colors.purpleDim}
              multiline
            />
            <Text style={styles.label}>Job</Text>
            <TextInput style={styles.input} value={currentUser.job}
              onChangeText={(v) => updateCurrentUser({ job: v })}
              placeholder="Your profession" placeholderTextColor={Colors.purpleDim} />
            <Text style={styles.label}>Education</Text>
            <TextInput style={styles.input} value={currentUser.education}
              onChangeText={(v) => updateCurrentUser({ education: v })}
              placeholder="Your university/school" placeholderTextColor={Colors.purpleDim} />
          </View>

          {/* Icebreaker prompts */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✨ Icebreaker Prompts</Text>
            {currentUser.prompts.map((p, idx) => (
              <View key={p.id} style={styles.promptCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                  {PROMPT_QUESTIONS_CATALOG.map((q) => (
                    <TouchableOpacity key={q}
                      style={[styles.chip, p.question === q && styles.chipActive, { marginRight: 6 }]}
                      onPress={() => updatePrompt(idx, q, p.answer)}>
                      {p.question === q ? (
                        <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                          <Text style={[styles.chipTextActive, { fontSize: 10 }]}>{q}</Text>
                        </LinearGradient>
                      ) : <Text style={[styles.chipText, { fontSize: 10 }]}>{q}</Text>}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[styles.input, { minHeight: 56, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={p.answer}
                  onChangeText={(v) => updatePrompt(idx, p.question, v)}
                  placeholder="Your honest/witty answer..."
                  placeholderTextColor={Colors.purpleDim}
                  multiline
                />
              </View>
            ))}
          </View>

          {/* Interests */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Interests ({currentUser.interests.length} selected)</Text>
            <Text style={styles.label}>Select at least 4 passions</Text>
            <View style={styles.chipRow}>
              {ALL_INTEREST_TAGS.map((tag) => {
                const sel = currentUser.interests.includes(tag);
                return (
                  <TouchableOpacity key={tag} style={[styles.chip, sel && styles.chipActive]}
                    onPress={() => toggleInterest(tag)}>
                    {sel ? (
                      <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipGrad}>
                        <Text style={styles.chipTextActive}>{tag}</Text>
                      </LinearGradient>
                    ) : <Text style={styles.chipText}>{tag}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Privacy controls */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔒 Privacy & Visibility</Text>
            {[
              { key: 'incognito', label: 'Incognito Browsing', sub: 'Only liked users see your profile' },
              { key: 'hideAge', label: 'Hide Age', sub: 'Don\'t show your age on discovery card' },
              { key: 'readReceipts', label: 'Read Receipts', sub: 'Let matches know when you\'ve read messages' },
            ].map((item) => (
              <View key={item.key} style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, (currentUser as any)[item.key] && styles.toggleOn]}
                  onPress={() => updateCurrentUser({ [item.key]: !(currentUser as any)[item.key] } as any)}
                >
                  <Text style={(currentUser as any)[item.key] ? styles.toggleCheckOn : styles.toggleCheck}>
                    {(currentUser as any)[item.key] ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* FCM Push Notifications */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardTitle}>🔔 Push Notifications (FCM)</Text>
                <Text style={styles.cardSub}>Firebase Cloud Messaging active</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFcmModalOpen(true)}
                style={styles.verifyBtn}
              >
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verifyGrad}>
                  <Text style={styles.verifyText}>Configure &amp; Test →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={[styles.toggleRow, { marginTop: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Channels: Sparks, Chat, Safety Guardian</Text>
                <Text style={styles.toggleSub}>High-priority background push delivery with sound &amp; haptics</Text>
              </View>
            </View>
          </View>

          {/* Account & Sign out */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🛡 Account & Security</Text>
            <View style={styles.signOutRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.signOutLabel}>Active Session</Text>
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>Logged In</Text>
                  </View>
                </View>
                <Text style={styles.signOutSub} numberOfLines={1}>
                  {authUser ? authUser.email || authUser.name : currentUser.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={() =>
                  Alert.alert(
                    'Sign Out of Fiffy\'s',
                    'Are you sure you want to sign out? You can sign back in anytime with your credentials.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign Out',
                        style: 'destructive',
                        onPress: async () => {
                          await logoutUser();
                        },
                      },
                    ]
                  )
                }
              >
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>

      {selfieOpen && (
        <SelfieModal photo={currentUser.photos[0]} onClose={() => setSelfieOpen(false)} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 16 },
  title: { color: Colors.white, fontSize: 24, fontWeight: '900' },
  sub: { color: Colors.purpleDim, fontSize: 12, marginTop: 3 },
  verifiedBadge: { backgroundColor: 'rgba(56,189,248,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(56,189,248,0.4)' },
  verifiedText: { color: Colors.sky, fontSize: 12, fontWeight: '700' },
  verifyBtn: { borderRadius: 14, overflow: 'hidden' },
  verifyGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  verifyText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: 'rgba(14,6,29,0.85)', borderRadius: 22, borderWidth: 1, borderColor: Colors.border, padding: 18, marginBottom: 14, gap: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  cardSub: { color: Colors.pinkLight, fontSize: 11, fontWeight: '600' },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(22,9,45,1)', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginTop: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  section: { marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  sectionSub: { color: Colors.purpleDim, fontSize: 11 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: { width: '30%', aspectRatio: 0.75, borderRadius: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: Colors.border },
  photoImg: { width: '100%', height: '100%' },
  mainBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: Colors.pinkLight, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  mainBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  removeBtn: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  addPhotoSlot: { width: '30%', aspectRatio: 0.75, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(168,85,247,0.4)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,8,40,0.4)' },
  addPhotoIcon: { color: Colors.pinkLight, fontSize: 28, fontWeight: '300' },
  addPhotoText: { color: Colors.purpleText, fontSize: 11, fontWeight: '600', marginTop: 4 },
  label: { color: Colors.purpleText, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: 'rgba(22,9,45,0.8)', borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 11, color: Colors.white, fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(22,9,45,0.7)' },
  chipActive: { borderColor: Colors.pinkLight },
  chipGrad: { paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 6 },
  chipTextActive: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  promptCard: { backgroundColor: 'rgba(21,8,42,0.7)', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 8, gap: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(21,8,42,0.7)', borderWidth: 1, borderColor: Colors.border, marginTop: 8, gap: 10 },
  toggleLabel: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  toggleSub: { color: Colors.purpleDim, fontSize: 11, marginTop: 2 },
  toggle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: Colors.pinkLight },
  toggleCheck: { color: Colors.purpleDim, fontSize: 15 },
  toggleCheckOn: { color: Colors.pinkLight, fontSize: 15, fontWeight: '800' },
  signOutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  signOutLabel: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  signOutSub: { color: Colors.purpleDim, fontSize: 11, marginTop: 2 },
  signOutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(244,63,94,0.12)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.3)' },
  signOutBtnText: { color: Colors.rose, fontSize: 12, fontWeight: '700' },
  activeTag: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  activeTagText: { color: '#34d399', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    gap: 10,
  },
  optionCardActive: {
    borderColor: Colors.pinkLight,
    backgroundColor: 'rgba(236,72,153,0.12)',
  },
});

const sv = StyleSheet.create({
  card: { backgroundColor: '#120625', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(236,72,153,0.4)', padding: 28, alignItems: 'center', width: '100%', gap: 12 },
  countdown: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(236,72,153,0.2)', borderWidth: 2, borderColor: Colors.pinkLight, alignItems: 'center', justifyContent: 'center' },
  countdownText: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  title: { color: Colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  sub: { color: Colors.purpleText, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  imgWrap: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden', borderWidth: 3, borderColor: Colors.pinkLight },
  img: { width: '100%', height: '100%' },
});
