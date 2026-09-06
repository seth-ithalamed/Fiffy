import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { Colors, gradientPink } from '../ui/Colors';

const PAYMENT_METHODS = [
  { id: 'card', label: '💳  Visa / Mastercard Credit', sub: 'Secure 3D-verified payment' },
  { id: 'eft', label: '🏦  Instant Bank Transfer (EFT)', sub: 'South African bank accounts' },
  { id: 'ozow', label: '⚡  Ozow Instant EFT', sub: 'Pay directly from your bank app' },
  { id: 'capitec', label: '🟦  Capitec Pay', sub: 'Capitec Bank customers' },
];

export function PaymentModal() {
  const { isPaymentModalOpen, closePaymentModal, selectedPlan, completePayment } = useApp();
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  if (!isPaymentModalOpen || !selectedPlan) return null;

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    completePayment();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={closePaymentModal}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Complete Payment</Text>
          <TouchableOpacity onPress={closePaymentModal} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          {/* Plan summary */}
          <LinearGradient colors={['rgba(255,42,133,0.12)', 'rgba(168,85,247,0.12)']} style={s.planSummary}>
            <Text style={s.planName}>{selectedPlan.name}</Text>
            <Text style={s.planPrice}>${selectedPlan.priceUsd?.toFixed(2)} / {selectedPlan.billingCycle}</Text>
            <Text style={s.planDesc}>{selectedPlan.description}</Text>
          </LinearGradient>

          {/* Payment methods */}
          <Text style={s.sectionLabel}>Select Payment Method</Text>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[s.methodRow, method === m.id && s.methodRowActive]}
              onPress={() => setMethod(m.id)}
            >
              <Text style={s.methodLabel}>{m.label}</Text>
              <Text style={s.methodSub}>{m.sub}</Text>
              {method === m.id && (
                <LinearGradient colors={gradientPink} style={s.selectedDot} />
              )}
            </TouchableOpacity>
          ))}

          <Text style={s.note}>
            🔒 Powered by PayFast — 256-bit SSL encrypted. You will not be charged until you confirm below.
          </Text>

          <TouchableOpacity
            onPress={handlePay}
            disabled={processing}
            style={s.payBtn}
          >
            <LinearGradient colors={gradientPink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.payGrad}>
              <Text style={s.payText}>
                {processing ? '⏳  Processing...' : `💳  Pay $${selectedPlan.priceUsd?.toFixed(2)} — Activate ${selectedPlan.name}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={closePaymentModal} style={s.cancelBtn}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: Colors.purpleText, fontSize: 15 },
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  planSummary: { borderRadius: 20, padding: 18, gap: 4, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' },
  planName: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  planPrice: { color: Colors.pinkLight, fontSize: 22, fontWeight: '900' },
  planDesc: { color: Colors.purpleText, fontSize: 12 },
  sectionLabel: { color: Colors.purpleText, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  methodRow: {
    padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: 'rgba(22,9,45,0.7)', gap: 3, position: 'relative',
  },
  methodRowActive: { borderColor: Colors.pinkLight, backgroundColor: 'rgba(236,72,153,0.08)' },
  methodLabel: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  methodSub: { color: Colors.purpleDim, fontSize: 11 },
  selectedDot: { position: 'absolute', top: 14, right: 14, width: 10, height: 10, borderRadius: 5 },
  note: { color: Colors.purpleDim, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 10 },
  payBtn: { borderRadius: 18, overflow: 'hidden' },
  payGrad: { paddingVertical: 16, alignItems: 'center' },
  payText: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  cancelBtn: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { color: Colors.purpleText, fontSize: 13, fontWeight: '600' },
});
