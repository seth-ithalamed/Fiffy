import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from './Colors';

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => dismissToast(t.id)}
          activeOpacity={0.9}
          style={[
            styles.toast,
            t.type === 'success' && styles.success,
            t.type === 'error' && styles.error,
          ]}
        >
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.desc}>{t.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 999,
    gap: 8,
  },
  toast: {
    backgroundColor: '#1a0b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 6,
  },
  success: { borderColor: 'rgba(236,72,153,0.4)' },
  error: { borderColor: 'rgba(244,63,94,0.4)' },
  title: { color: Colors.white, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  desc: { color: Colors.purpleText, fontSize: 11 },
});
