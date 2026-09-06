import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  Dimensions, Modal, PanResponder, Animated, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { Colors, gradientPink } from '../components/ui/Colors';
import { GradientButton } from '../components/ui/GradientButton';
import { AFRICAN_COUNTRIES } from '../data/mockData';

const { width: SW, height: SH } = Dimensions.get('window');
const CARD_W = SW - 32;
const CARD_H = SH * 0.62;
const SWIPE_THRESHOLD = 100;

// ── Profile Detail Modal ────────────────────────────────────────────────────
function ProfileModal({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={pm.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photos */}
          <View style={{ height: SH * 0.52 }}>
            <Image
              source={{ uri: profile.photos[photoIdx] }}
              style={pm.photo}
              resizeMode="cover"
            />
            <LinearGradient colors={['transparent', 'rgba(5,2,10,0.95)']} style={pm.photoGrad} />
            {/* Pill indicators */}
            <View style={pm.pillRow}>
              {profile.photos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPhotoIdx(i)}
                  style={[pm.pill, i === photoIdx && pm.pillActive]} />
              ))}
            </View>
            <View style={pm.photoBadges}>
              <View style={pm.countryBadge}>
                <Text style={pm.badgeText}>{profile.countryFlag} {profile.country}</Text>
              </View>
              {profile.verified && (
                <View style={pm.verifiedBadge}>
                  <Text style={pm.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
            <View style={pm.nameRow}>
              <Text style={pm.name}>{profile.name}, {profile.age}</Text>
            </View>
          </View>

          <View style={pm.body}>
            <Text style={pm.job}>💼 {profile.job}</Text>
            {profile.education ? <Text style={pm.meta}>🎓 {profile.education}</Text> : null}
            <Text style={pm.meta}>📍 {profile.location}</Text>
            {profile.height ? <Text style={pm.meta}>📏 {profile.height}</Text> : null}
            {profile.starSign ? <Text style={pm.meta}>✨ {profile.starSign}</Text> : null}
            {profile.datingGoal ? <Text style={pm.meta}>💛 {profile.datingGoal}</Text> : null}

            {profile.bio ? (
              <View style={pm.section}>
                <Text style={pm.sectionTitle}>About</Text>
                <Text style={pm.bio}>{profile.bio}</Text>
              </View>
            ) : null}

            {profile.prompts.length > 0 && (
              <View style={pm.section}>
                <Text style={pm.sectionTitle}>Icebreakers</Text>
                {profile.prompts.map((p) => (
                  <View key={p.id} style={pm.promptCard}>
                    <Text style={pm.promptQ}>{p.question}</Text>
                    <Text style={pm.promptA}>"{p.answer}"</Text>
                  </View>
                ))}
              </View>
            )}

            {profile.interests.length > 0 && (
              <View style={pm.section}>
                <Text style={pm.sectionTitle}>Interests</Text>
                <View style={pm.tagRow}>
                  {profile.interests.map((t) => (
                    <View key={t} style={pm.tag}><Text style={pm.tagText}>{t}</Text></View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
          <Text style={pm.closeTxt}>✕  Close Profile</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ── Filter Drawer ──────────────────────────────────────────────────────────
function FilterDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { filters, updateFilters } = useApp();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={fd.container}>
        <View style={fd.header}>
          <Text style={fd.title}>Discovery Preferences</Text>
          <TouchableOpacity onPress={onClose} style={fd.closeBtn}>
            <Text style={fd.closeTxt}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Country */}
          <View>
            <Text style={fd.label}>Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[fd.pill, filters.targetCountry === 'all' && fd.pillActive]}
                onPress={() => updateFilters({ targetCountry: 'all' })}
              >
                {filters.targetCountry === 'all' ? (
                  <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fd.pillGrad}>
                    <Text style={fd.pillTextActive}>🌍 All</Text>
                  </LinearGradient>
                ) : <Text style={fd.pillText}>🌍 All</Text>}
              </TouchableOpacity>
              {AFRICAN_COUNTRIES.map((c) => {
                const sel = filters.targetCountry.toLowerCase() === c.name.toLowerCase();
                return (
                  <TouchableOpacity key={c.code} style={[fd.pill, sel && fd.pillActive]}
                    onPress={() => updateFilters({ targetCountry: c.name })}>
                    {sel ? (
                      <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fd.pillGrad}>
                        <Text style={fd.pillTextActive}>{c.flag} {c.name.split(' ')[0]}</Text>
                      </LinearGradient>
                    ) : <Text style={fd.pillText}>{c.flag} {c.name.split(' ')[0]}</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Gender */}
          <View>
            <Text style={fd.label}>Show Me</Text>
            <View style={fd.chipRow}>
              {(['everyone', 'women', 'men'] as const).map((g) => {
                const sel = filters.genderPreference === g;
                return (
                  <TouchableOpacity key={g} style={[fd.chip, sel && fd.chipActive]}
                    onPress={() => updateFilters({ genderPreference: g })}>
                    {sel ? (
                      <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fd.chipGrad}>
                        <Text style={fd.chipTextActive}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                      </LinearGradient>
                    ) : <Text style={fd.chipText}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Age range */}
          <View>
            <Text style={fd.label}>Max Age: <Text style={{ color: Colors.pinkLight, fontWeight: '700' }}>{filters.ageRange[1]}</Text></Text>
            <View style={fd.sliderRow}>
              {[22, 25, 30, 35, 40, 45, 55, 65].map((v) => {
                const sel = filters.ageRange[1] === v;
                return (
                  <TouchableOpacity key={v} style={[fd.agePill, sel && fd.agePillActive]}
                    onPress={() => updateFilters({ ageRange: [filters.ageRange[0], v] })}>
                    <Text style={[fd.ageText, sel && { color: Colors.white, fontWeight: '700' }]}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Verified only */}
          <View style={fd.toggleRow}>
            <View>
              <Text style={fd.toggleLabel}>Verified Profiles Only</Text>
              <Text style={fd.toggleSub}>Only show selfie-verified members</Text>
            </View>
            <TouchableOpacity
              style={[fd.toggle, filters.verifiedOnly && fd.toggleOn]}
              onPress={() => updateFilters({ verifiedOnly: !filters.verifiedOnly })}
            >
              <Text style={filters.verifiedOnly ? fd.toggleCheckOn : fd.toggleCheck}>
                {filters.verifiedOnly ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Swipe Card ─────────────────────────────────────────────────────────────
function SwipeCard({ profile }: { profile: UserProfile; key?: string }) {
  const { handleSwipe, setInspectedProfile, currentUser } = useApp();
  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  const [photoIdx, setPhotoIdx] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const passOpacity = useRef(new Animated.Value(0)).current;

  const rotate = pan.x.interpolate({ inputRange: [-SW, SW], outputRange: ['-18deg', '18deg'] });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipe('like', profile);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipe('pass', profile);
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          handleSwipe('superlike', profile);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
        likeOpacity.setValue(0);
        passOpacity.setValue(0);
      },
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  // Update like/nope opacity while dragging
  pan.x.addListener(({ value }) => {
    likeOpacity.setValue(Math.max(0, Math.min(1, value / 100)));
    passOpacity.setValue(Math.max(0, Math.min(1, -value / 100)));
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[sc.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
    >
      {/* Photo */}
      <Image
        source={{ uri: profile.photos[photoIdx % profile.photos.length] }}
        style={sc.photo}
        resizeMode="cover"
      />

      {/* Photo dots */}
      <View style={sc.dotRow}>
        {profile.photos.map((_, i) => (
          <View key={i} style={[sc.dot, i === photoIdx % profile.photos.length && sc.dotActive]} />
        ))}
      </View>

      {/* Tap zones */}
      <TouchableOpacity
        style={sc.tapLeft}
        onPress={() => setPhotoIdx((p) => (p - 1 + profile.photos.length) % profile.photos.length)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={sc.tapRight}
        onPress={() => setPhotoIdx((p) => (p + 1) % profile.photos.length)}
        activeOpacity={1}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(5,2,10,0.92)']}
        style={sc.grad}
        pointerEvents="none"
      />

      {/* LIKE stamp */}
      <Animated.View style={[sc.stamp, sc.stampLike, { opacity: likeOpacity }]}>
        <Text style={sc.stampTextLike}>{isFreeTier ? 'UPGRADE 🔒' : 'LIKE 💖'}</Text>
      </Animated.View>
      {/* NOPE stamp */}
      <Animated.View style={[sc.stamp, sc.stampNope, { opacity: passOpacity }]}>
        <Text style={sc.stampTextNope}>PASS ✕</Text>
      </Animated.View>

      {/* Country + verified badges */}
      <View style={sc.topBadges}>
        <View style={sc.countryBadge}>
          <Text style={sc.badgeText}>{profile.countryFlag} {profile.country}</Text>
        </View>
        {profile.verified && (
          <View style={sc.verifiedBadge}>
            <Text style={sc.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      {/* Bottom info */}
      <View style={sc.bottomInfo}>
        <View style={sc.nameRow}>
          <Text style={sc.name}>{profile.name}, {profile.age}</Text>
          <TouchableOpacity
            style={sc.infoBtn}
            onPress={() => setInspectedProfile(profile)}
          >
            <Text style={{ color: Colors.white, fontSize: 16 }}>ℹ</Text>
          </TouchableOpacity>
        </View>
        <Text style={sc.location}>📍 {profile.location}  •  💼 {profile.job}</Text>
        <Text style={sc.quote} numberOfLines={2}>
          "{profile.prompts[0]?.answer || profile.bio}"
        </Text>
        <View style={sc.tagRow}>
          {profile.interests.slice(0, 3).map((t) => (
            <View key={t} style={sc.tag}><Text style={sc.tagText}>{t}</Text></View>
          ))}
          {profile.interests.length > 3 && (
            <View style={sc.tag}>
              <Text style={sc.tagText}>+{profile.interests.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Discovery Screen ──────────────────────────────────────────────────
export default function DiscoveryScreen() {
  const {
    filteredProfiles, activeCard, currentCardIndex, filters,
    updateFilters, handleSwipe, undoLastSwipe, canUndo,
    viewMode, setViewMode, setInspectedProfile, inspectedProfile,
    currentUser, setMonetizationOpen,
  } = useApp();

  const [filterOpen, setFilterOpen] = useState(false);
  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  return (
    <LinearGradient colors={['#1a0b2e', '#050208']} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'swipe' && styles.toggleBtnActive]}
              onPress={() => setViewMode('swipe')}
            >
              {viewMode === 'swipe' ? (
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.toggleGrad}>
                  <Text style={styles.toggleTextActive}>≡  Cards</Text>
                </LinearGradient>
              ) : <Text style={styles.toggleText}>≡  Cards</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              {viewMode === 'grid' ? (
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.toggleGrad}>
                  <Text style={styles.toggleTextActive}>⊞  Browse</Text>
                </LinearGradient>
              ) : <Text style={styles.toggleText}>⊞  Browse</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <Text style={styles.filterBtnText}>⚙  Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Country quick pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContent}
        >
          <TouchableOpacity
            style={[styles.countryPill, filters.targetCountry === 'all' && styles.countryPillActive]}
            onPress={() => updateFilters({ targetCountry: 'all' })}
          >
            {filters.targetCountry === 'all' ? (
              <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pillGrad}>
                <Text style={styles.pillTextActive}>🌍 All</Text>
              </LinearGradient>
            ) : <Text style={styles.pillText}>🌍 All</Text>}
          </TouchableOpacity>
          {AFRICAN_COUNTRIES.map((c) => {
            const sel = filters.targetCountry.toLowerCase() === c.name.toLowerCase();
            return (
              <TouchableOpacity key={c.code}
                style={[styles.countryPill, sel && styles.countryPillActive]}
                onPress={() => updateFilters({ targetCountry: c.name })}
              >
                {sel ? (
                  <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pillGrad}>
                    <Text style={styles.pillTextActive}>{c.flag} {c.name.split(' ')[0]}</Text>
                  </LinearGradient>
                ) : <Text style={styles.pillText}>{c.flag} {c.name.split(' ')[0]}</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Free tier notice */}
        {isFreeTier && (
          <View style={styles.freeBanner}>
            <Text style={styles.freeBannerText}>🔒 Free Plan: Profile View Only</Text>
            <TouchableOpacity onPress={() => setMonetizationOpen(true)}>
              <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeSmall}>
                <Text style={styles.upgradeSmallText}>Upgrade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Count */}
        <Text style={styles.countText}>
          {filteredProfiles.length} singles in {filters.targetCountry === 'all' ? 'all countries' : filters.targetCountry}
        </Text>

        {/* ── SWIPE MODE ── */}
        {viewMode === 'swipe' && (
          <View style={styles.cardArea}>
            {activeCard ? (
              <SwipeCard key={activeCard.id} profile={activeCard} />
            ) : (
              <View style={styles.emptyDeck}>
                <Text style={styles.emptyIcon}>🌍</Text>
                <Text style={styles.emptyTitle}>No More Singles</Text>
                <Text style={styles.emptySub}>Expand your horizons — try all countries or adjust your preferences.</Text>
                <GradientButton
                  title="🌍  Explore All Countries"
                  onPress={() => updateFilters({ targetCountry: 'all' })}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}

            {/* Action dock */}
            {activeCard && (
              <View style={styles.dock}>
                <TouchableOpacity
                  style={[styles.dockBtn, styles.dockUndo, !canUndo && styles.dockDisabled]}
                  onPress={undoLastSwipe}
                  disabled={!canUndo}
                >
                  <Text style={styles.dockIcon}>↩</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dockBtn, styles.dockPass]}
                  onPress={() => handleSwipe('pass', activeCard)}
                >
                  <Text style={[styles.dockIcon, { fontSize: 26 }]}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dockBtn, styles.dockSuper]}
                  onPress={() => handleSwipe('superlike', activeCard)}
                >
                  <Text style={styles.dockIcon}>★</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dockBtn, styles.dockLike]}
                  onPress={() => handleSwipe('like', activeCard)}
                >
                  <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dockLikeGrad}>
                    <Text style={[styles.dockIcon, { color: Colors.white, fontSize: 26 }]}>♥</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── GRID MODE ── */}
        {viewMode === 'grid' && (
          <FlatList
            data={filteredProfiles}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridCard}
                onPress={() => setInspectedProfile(item)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.photos[0] }} style={styles.gridPhoto} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(5,2,10,0.92)']} style={styles.gridGrad} />
                <View style={styles.gridBadge}>
                  <Text style={styles.gridBadgeText}>{item.countryFlag} {item.city}</Text>
                </View>
                <View style={styles.gridInfo}>
                  <Text style={styles.gridName}>{item.name}, {item.age}</Text>
                  <Text style={styles.gridJob} numberOfLines={1}>{item.job}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Profile detail modal */}
        {inspectedProfile && (
          <ProfileModal profile={inspectedProfile} onClose={() => setInspectedProfile(null)} />
        )}

        {/* Filter drawer */}
        <FilterDrawer visible={filterOpen} onClose={() => setFilterOpen(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  viewToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(22,9,45,0.8)',
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 3,
  },
  toggleBtn: { borderRadius: 10, overflow: 'hidden' },
  toggleBtnActive: {},
  toggleGrad: { paddingHorizontal: 12, paddingVertical: 6 },
  toggleText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 6 },
  toggleTextActive: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(22,9,45,0.8)', borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600' },
  pillScroll: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  pillContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 6, alignItems: 'center' },
  countryPill: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)' },
  countryPillActive: { borderColor: Colors.pinkLight },
  pillGrad: { paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { color: Colors.purpleText, fontSize: 11, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 5 },
  pillTextActive: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  freeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 8, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)',
    backgroundColor: 'rgba(255,42,133,0.07)',
  },
  freeBannerText: { color: Colors.purpleText, fontSize: 11, fontWeight: '600' },
  upgradeSmall: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  upgradeSmallText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  countText: { color: Colors.purpleDim, fontSize: 11, paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  dock: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 14, marginBottom: 12, marginTop: 8,
  },
  dockBtn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: 'rgba(22,9,45,0.85)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  dockDisabled: { opacity: 0.3 },
  dockUndo: { borderColor: 'rgba(251,191,36,0.4)' },
  dockPass: { width: 58, height: 58, borderRadius: 29, borderColor: 'rgba(244,63,94,0.4)' },
  dockSuper: { borderColor: 'rgba(56,189,248,0.4)' },
  dockLike: { width: 58, height: 58, borderRadius: 29, overflow: 'hidden', borderWidth: 0 },
  dockLikeGrad: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29 },
  dockIcon: { fontSize: 22, color: Colors.purpleText },
  emptyDeck: {
    backgroundColor: 'rgba(20,8,39,0.9)', borderRadius: 28, padding: 36,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, width: CARD_W,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  emptySub: { color: Colors.purpleText, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  grid: { padding: 16, gap: 10 },
  gridCard: { flex: 1, aspectRatio: 0.75, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  gridPhoto: { width: '100%', height: '100%', position: 'absolute' },
  gridGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  gridBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  gridBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  gridInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  gridName: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  gridJob: { color: Colors.purpleText, fontSize: 11, marginTop: 2 },
});

const sc = StyleSheet.create({
  card: {
    width: CARD_W, height: CARD_H, borderRadius: 28, overflow: 'hidden',
    backgroundColor: '#140827',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 12,
  },
  photo: { width: '100%', height: '100%', position: 'absolute' },
  grad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  dotRow: { position: 'absolute', top: 10, left: 12, right: 12, flexDirection: 'row', gap: 3, zIndex: 30 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.white },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '33%', zIndex: 20 },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '33%', zIndex: 20 },
  stamp: {
    position: 'absolute', top: 36, zIndex: 30,
    borderWidth: 3, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10,
  },
  stampLike: { left: 16, borderColor: Colors.emerald, transform: [{ rotate: '-16deg' }] },
  stampNope: { right: 16, borderColor: Colors.rose, transform: [{ rotate: '16deg' }] },
  stampTextLike: { color: Colors.emerald, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  stampTextNope: { color: Colors.rose, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  topBadges: { position: 'absolute', top: 28, left: 12, zIndex: 20, flexDirection: 'row', gap: 6 },
  countryBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  verifiedBadge: {
    backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  bottomInfo: { position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: Colors.white, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  infoBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  location: { color: Colors.purpleText, fontSize: 11, marginTop: 4 },
  quote: {
    color: 'rgba(226,232,240,0.9)', fontSize: 11, lineHeight: 16, marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.45)', padding: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
    paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: { color: Colors.white, fontSize: 10, fontWeight: '600' },
});

const pm = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0414' },
  photo: { width: '100%', height: SH * 0.52 },
  photoGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  pillRow: { position: 'absolute', top: 14, left: 16, right: 16, flexDirection: 'row', gap: 4 },
  pill: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  pillActive: { backgroundColor: Colors.white },
  photoBadges: { position: 'absolute', top: 32, left: 14, flexDirection: 'row', gap: 6 },
  countryBadge: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  verifiedBadge: { backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  nameRow: { position: 'absolute', bottom: 16, left: 16 },
  name: { color: Colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  body: { padding: 20, gap: 6 },
  job: { color: Colors.purpleText, fontSize: 13, fontWeight: '600' },
  meta: { color: Colors.purpleDim, fontSize: 12 },
  section: { marginTop: 16 },
  sectionTitle: { color: Colors.pinkLight, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  bio: { color: Colors.slate, fontSize: 13, lineHeight: 20 },
  promptCard: {
    backgroundColor: 'rgba(22,9,45,0.8)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  promptQ: { color: Colors.pinkLight, fontSize: 11, fontWeight: '700', marginBottom: 5 },
  promptA: { color: Colors.slate, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { backgroundColor: 'rgba(236,72,153,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)' },
  tagText: { color: Colors.pinkLight, fontSize: 12, fontWeight: '600' },
  closeBtn: {
    margin: 16, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  closeTxt: { color: Colors.purpleText, fontSize: 14, fontWeight: '700' },
});

const fd = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0620' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  closeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(236,72,153,0.15)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)' },
  closeTxt: { color: Colors.pinkLight, fontSize: 13, fontWeight: '700' },
  label: { color: Colors.purpleText, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  pill: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 6 },
  pillActive: { borderColor: Colors.pinkLight },
  pillGrad: { paddingHorizontal: 14, paddingVertical: 7 },
  pillText: { color: Colors.purpleText, fontSize: 12, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 7 },
  pillTextActive: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(22,9,45,0.8)' },
  chipActive: { borderColor: Colors.pinkLight },
  chipGrad: { paddingHorizontal: 18, paddingVertical: 9 },
  chipText: { color: Colors.purpleText, fontSize: 13, fontWeight: '600', paddingHorizontal: 18, paddingVertical: 9 },
  chipTextActive: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  agePill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
    backgroundColor: 'rgba(22,9,45,0.8)', borderWidth: 1, borderColor: Colors.border,
  },
  agePillActive: { borderColor: Colors.pinkLight, backgroundColor: 'rgba(236,72,153,0.15)' },
  ageText: { color: Colors.purpleText, fontSize: 12 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 16, backgroundColor: 'rgba(22,9,45,0.8)', borderWidth: 1, borderColor: Colors.border,
  },
  toggleLabel: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  toggleSub: { color: Colors.purpleDim, fontSize: 11, marginTop: 2 },
  toggle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: Colors.pinkLight },
  toggleCheck: { color: Colors.purpleDim, fontSize: 16 },
  toggleCheckOn: { color: Colors.pinkLight, fontSize: 16, fontWeight: '800' },
});
