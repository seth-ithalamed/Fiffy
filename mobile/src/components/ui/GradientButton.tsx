import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, gradientPink } from './Colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export const GradientButton: React.FC<Props> = ({
  title,
  onPress,
  loading,
  disabled,
  style,
  small,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
    style={[styles.wrapper, small && styles.small, style]}
  >
    <LinearGradient
      colors={gradientPink}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, small && styles.gradientSmall]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.text, small && styles.textSmall]}>{title}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden' },
  small: { borderRadius: 12 },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientSmall: { paddingVertical: 8, paddingHorizontal: 16 },
  text: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  textSmall: { fontSize: 12 },
});
