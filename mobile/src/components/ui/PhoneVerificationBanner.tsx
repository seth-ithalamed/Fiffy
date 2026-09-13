import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from './Colors';

export const PhoneVerificationBanner: React.FC = () => {
  const { authUser, currentUser, openPhoneVerificationModal } = useApp();

  if (!authUser || currentUser?.phoneVerified) {
    return null;
  }

  const phoneDisplay = currentUser?.contactNumber || currentUser?.phone || authUser?.contactNumber || authUser?.phone || 'your phone';

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          SMS code sent to <Text style={styles.phoneBold}>{phoneDisplay}</Text>. Verify to secure account.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => openPhoneVerificationModal()}
        style={styles.btn}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  text: {
    color: '#fef3c7',
    fontSize: 11,
    flex: 1,
    fontWeight: '500',
  },
  phoneBold: {
    color: Colors.white,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  btn: {
    backgroundColor: '#ff2a85',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#ff2a85',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
});
