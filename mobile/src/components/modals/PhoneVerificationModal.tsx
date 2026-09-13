import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { Colors, gradientPink } from '../ui/Colors';
import { GradientButton } from '../ui/GradientButton';

export function PhoneVerificationModal() {
  const {
    isPhoneVerificationModalOpen,
    closePhoneVerificationModal,
    phoneVerificationData,
    verifyPhoneOtp,
    resendPhoneOtp,
    currentUser,
    authUser,
    showToast,
  } = useApp();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(25);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // When modal opens, reset state & start 25s timer
  useEffect(() => {
    if (isPhoneVerificationModalOpen) {
      setCode('');
      setError(null);
      setResendNotice(null);
      setResendTimer(25);
    }
  }, [isPhoneVerificationModalOpen]);

  // Resend countdown timer
  useEffect(() => {
    if (!isPhoneVerificationModalOpen) return;
    if (resendTimer <= 0) return;

    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPhoneVerificationModalOpen, resendTimer]);

  if (!isPhoneVerificationModalOpen) return null;

  const targetPhone =
    phoneVerificationData?.formattedPhone ||
    phoneVerificationData?.phone ||
    currentUser?.contactNumber ||
    currentUser?.phone ||
    authUser?.contactNumber ||
    authUser?.phone ||
    'your mobile number';

  const simulatedCode = phoneVerificationData?.verificationCode;

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed || trimmed.length < 4) {
      setError('Please enter the 6-digit SMS verification code.');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await verifyPhoneOtp(trimmed);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Verification code incorrect or expired. Please check SMS.');
    } else {
      showToast('Mobile Verified! 📱', 'Your phone number has been successfully verified.', 'success');
      closePhoneVerificationModal();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setError(null);
    setResending(true);
    setResendNotice(null);

    const res = await resendPhoneOtp();
    setResending(false);

    if (res.success) {
      setResendTimer(25);
      setResendNotice(res.message || 'New 6-digit code dispatched via SMS!');
      showToast('Code Resent', 'A fresh verification code has been sent.', 'info');
    } else {
      setError(res.error || 'Failed to resend SMS. Please check your number.');
    }
  };

  const handleDismiss = () => {
    closePhoneVerificationModal();
    showToast('Verification Pending', 'You can verify your number later from your profile or top banner.', 'info');
  };

  return (
    <Modal
      visible={isPhoneVerificationModalOpen}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.keyboardWrap}
        >
          <View style={s.card}>
            {/* Background subtle glow */}
            <LinearGradient
              colors={['rgba(255,42,133,0.14)', 'transparent', 'rgba(168,85,247,0.12)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Header & Close Button */}
            <View style={s.headerRow}>
              <View style={s.badge}>
                <Text style={s.badgeText}>SMS Dispatched 📱</Text>
              </View>
              <TouchableOpacity
                onPress={handleDismiss}
                style={s.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Icon */}
              <View style={s.iconWrap}>
                <LinearGradient
                  colors={gradientPink}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.iconGrad}
                >
                  <Text style={s.iconEmoji}>📲</Text>
                </LinearGradient>
              </View>

              {/* Title & Subtitle */}
              <Text style={s.title}>Verify Your Mobile Number</Text>
              <Text style={s.subtitle}>
                We sent a 6-digit SMS verification code to secure your Fiffy&apos;s account:
              </Text>

              {/* Destination phone chip */}
              <View style={s.phoneChip}>
                <Text style={s.phoneChipText}>{targetPhone}</Text>
              </View>

              {/* Sandbox Code Box (if in test/simulated environment) */}
              {!!simulatedCode && (
                <View style={s.sandboxBox}>
                  <View style={s.sandboxHeader}>
                    <Text style={s.sandboxTitle}>⚡ Sandbox Testing Code:</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setCode(simulatedCode);
                        setError(null);
                      }}
                      style={s.autofillBtn}
                    >
                      <Text style={s.autofillText}>Auto-fill</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.sandboxCode}>{simulatedCode}</Text>
                </View>
              )}

              {/* Error Callout */}
              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              {/* Resend Notice */}
              {!!resendNotice && (
                <View style={s.noticeBox}>
                  <Text style={s.noticeText}>✓ {resendNotice}</Text>
                </View>
              )}

              {/* Code Input */}
              <View style={s.inputContainer}>
                <Text style={s.inputLabel}>Enter 6-Digit SMS Code</Text>
                <TextInput
                  style={s.codeInput}
                  value={code}
                  onChangeText={(val) => {
                    setCode(val.replace(/[^0-9]/g, '').slice(0, 6));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="••••••"
                  placeholderTextColor={Colors.purpleDim}
                  autoFocus
                />
              </View>

              {/* Verify Action Button */}
              <GradientButton
                title="Verify Mobile Number"
                onPress={handleVerify}
                loading={loading}
                disabled={code.length < 4}
                style={s.verifyBtn}
              />

              {/* Resend & Dismiss Actions */}
              <View style={s.actionsWrap}>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendTimer > 0 || resending}
                  style={[s.resendBtn, resendTimer > 0 && s.resendBtnDisabled]}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color={Colors.pink} />
                  ) : (
                    <Text style={[s.resendText, resendTimer > 0 && s.resendTextDisabled]}>
                      {resendTimer > 0 ? `Resend SMS in ${resendTimer}s` : 'Resend SMS Code'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDismiss} style={s.laterBtn}>
                  <Text style={s.laterText}>Verify later</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 2, 10, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  keyboardWrap: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#120722',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 133, 0.3)',
    overflow: 'hidden',
    padding: 22,
    position: 'relative',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: 'rgba(255, 42, 133, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 133, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ff77aa',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.purpleDim,
    fontSize: 14,
    fontWeight: '700',
  },
  iconWrap: {
    marginBottom: 12,
  },
  iconGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(216, 180, 254, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  phoneChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 14,
  },
  phoneChipText: {
    color: Colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 13,
  },
  sandboxBox: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sandboxTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
  },
  autofillBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  autofillText: {
    color: '#fef3c7',
    fontSize: 10,
    fontWeight: '800',
  },
  sandboxCode: {
    color: '#fde68a',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  noticeBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  noticeText: {
    color: '#6ee7b7',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  inputLabel: {
    color: Colors.purpleDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeInput: {
    width: '100%',
    backgroundColor: '#0c0417',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 42, 133, 0.5)',
    borderRadius: 16,
    color: Colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  verifyBtn: {
    width: '100%',
    marginBottom: 12,
  },
  actionsWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  resendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  resendBtnDisabled: {
    opacity: 0.7,
  },
  resendText: {
    color: '#ff77aa',
    fontSize: 12,
    fontWeight: '700',
  },
  resendTextDisabled: {
    color: Colors.purpleDim,
  },
  laterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  laterText: {
    color: 'rgba(216, 180, 254, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
