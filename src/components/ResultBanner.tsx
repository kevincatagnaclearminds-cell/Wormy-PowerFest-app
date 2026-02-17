import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScanResult } from '../types';
import { COLORS } from '../config/colors';

interface ResultBannerProps {
  result: ScanResult | null;
}

export function ResultBanner({ result }: ResultBannerProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (result) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();

      // Animación de pulso para el icono
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      slideAnim.setValue(-100);
      scaleAnim.setValue(0.8);
    }
  }, [result]);

  if (!result) return <View style={styles.spacer} />;

  const isValid = result.status === 'valid';

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}>
      <LinearGradient
        colors={isValid ? [COLORS.success.light, COLORS.neutral.white] : [COLORS.error.light, COLORS.neutral.white]}
        style={[styles.banner, isValid ? styles.bannerValid : styles.bannerInvalid]}>
        <View style={styles.leftSection}>
          <Animated.View 
            style={[
              styles.iconContainer,
              isValid ? styles.iconContainerValid : styles.iconContainerInvalid,
              { transform: [{ scale: pulseAnim }] }
            ]}>
            <Ionicons 
              name={isValid ? "checkmark" : "close-circle"} 
              size={40} 
              color={isValid ? COLORS.neutral.white : COLORS.error.main} 
            />
          </Animated.View>
          <View style={styles.textContainer}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, isValid ? styles.statusTextValid : styles.statusTextInvalid]}>
                {isValid ? 'VÁLIDO' : 'INVÁLIDO'}
              </Text>
              {result.name && (
                <View style={styles.nameBadge}>
                  <Ionicons name="person" size={12} color={COLORS.text.primary} />
                  <Text style={styles.nameText} numberOfLines={1}>{result.name}</Text>
                </View>
              )}
            </View>
            <Text style={styles.dataText} numberOfLines={1}>{result.data}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color={COLORS.text.primary} />
            <Text style={styles.timeText}>{result.timestamp}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 80,
  },
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerValid: {
    borderWidth: 2,
    borderColor: COLORS.success.border,
  },
  bannerInvalid: {
    borderWidth: 2,
    borderColor: COLORS.error.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerValid: {
    backgroundColor: COLORS.success.main,
  },
  iconContainerInvalid: {
    backgroundColor: COLORS.error.light,
  },
  textContainer: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusTextValid: {
    color: COLORS.success.main,
  },
  statusTextInvalid: {
    color: COLORS.error.main,
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    maxWidth: 120,
  },
  nameText: {
    fontSize: 10,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  dataText: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontFamily: 'monospace',
    fontWeight: '600',
    opacity: 0.7,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
