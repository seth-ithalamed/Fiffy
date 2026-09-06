import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { Colors, gradientPink } from '../ui/Colors';

export function MonetizationModal() {
  const {
    isMonetizationOpen, setMonetizationOpen,
    subscriptionPlans, openPaymentModal,
    currentUser, activateBoost,
  } = useApp();

  return (
    <Modal visible={isMonetizationOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMonetizationOpen(false)}>
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Close */}
          <TouchableOpacity onPress={() => setMonetizationOpen(false)} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.header}>
            <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.badge}>
              <Text style={s.badgeText}>✦ Fiffy VIP Subscriptions</Text>
            </LinearGradient>
            <Text style={s.title}>Worldwide VIP Access</Text>
            <Text style={s.sub}>
              Unlimited cross-border matching, see who liked you, and 10x profile visibility.
            </Text>
          </View>

          {/* Plan cards */}
          {subscriptionPlans.slice(0, 2).map((plan) => (
            <View key={plan.id} style={[s.planCard, plan.isPopular && s.planCardPopular]}>
              {plan.isPopular && (
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.recommendedBadge}>
                  <Text style={s.recommendedText}>RECOMMENDED</Text>
                </LinearGradient>
              )}

              <Text style={s.planName}>{plan.name}</Text>
              {plan.description ? <Text style={s.planDesc}>{plan.description}</Text> : null}

              <View style={s.priceRow}>
                <Text style={s.price}>${plan.priceUsd?.toFixed(2) || '14.99'}</Text>
                <Text style={s.priceSub}> / {plan.billingCycle}</Text>
              </View>

              <View style={s.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={s.featureCheck}>✓</Text>
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={s.checkoutBtn}
                onPress={() => { setMonetizationOpen(false); openPaymentModal(plan); }}
              >
                <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.checkoutGrad}>
                  <Text style={s.checkoutText}>💳  Instant VIP Checkout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}

          {/* Boost */}
          <View style={s.boostCard}>
            <View style={s.boostLeft}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={s.boostIcon}>
                <Text style={{ fontSize: 18 }}>⚡</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.boostTitle}>Instant City Spotlight Boost
                  <Text style={s.boostPrice}> — $2.99</Text>
                </Text>
                <Text style={s.boostSub}>10x profile visibility in your city for 30 minutes.</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.boostBtn}
              onPress={() => {
                setMonetizationOpen(false);
                if (currentUser.boostsRemaining > 0) {
                  activateBoost();
                } else {
                  const boostPlan = {
                    id: 'plan-boost', name: 'Spotlight Boost',
                    priceUsd: 2.99, priceZar: 49,
                    billingCycle: 'one-time' as const,
                    description: '10x visibility for 30 minutes',
                    features: ['10x card placement', '30 min spotlight'],
                    isActive: true,
                  };
                  openPaymentModal(boostPlan);
                }
              }}
            >
              <Text style={s.boostBtnText}>
                {currentUser.boostsRemaining > 0 ? `Activate (${currentUser.boostsRemaining})` : 'Buy $2.99'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0620' },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { color: Colors.purpleText, fontSize: 16 },
  header: { alignItems: 'center', gap: 8, marginBottom: 4 },
  badge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { color: Colors.white, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  sub: { color: Colors.purpleText, fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  planCard: {
    backgroundColor: 'rgba(21,9,44,0.85)', borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)', padding: 18, position: 'relative', overflow: 'hidden',
  },
  planCardPopular: { borderColor: Colors.pinkLight, shadowColor: Colors.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  recommendedBadge: { position: 'absolute', top: -1, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  recommendedText: { color: Colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  planName: { color: Colors.white, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  planDesc: { color: Colors.purpleText, fontSize: 12, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  price: { color: Colors.white, fontSize: 32, fontWeight: '900' },
  priceSub: { color: Colors.purpleText, fontSize: 12, marginBottom: 4 },
  featureList: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureCheck: { color: Colors.pinkLight, fontSize: 13, fontWeight: '800', marginTop: 1 },
  featureText: { color: Colors.purpleText, fontSize: 12, flex: 1, lineHeight: 18 },
  checkoutBtn: { borderRadius: 16, overflow: 'hidden' },
  checkoutGrad: { paddingVertical: 14, alignItems: 'center' },
  checkoutText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  boostCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(21,9,44,0.85)', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)', padding: 16, gap: 10,
  },
  boostLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  boostIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  boostTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  boostPrice: { color: Colors.amber, fontSize: 12, fontWeight: '700' },
  boostSub: { color: Colors.purpleDim, fontSize: 11, marginTop: 2 },
  boostBtn: { backgroundColor: Colors.amber, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  boostBtnText: { color: '#1c1917', fontSize: 12, fontWeight: '800' },
});
