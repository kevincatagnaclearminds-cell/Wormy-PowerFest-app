import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ScanResult } from '../types';
import { COLORS } from '../config/colors';

interface ScanLogProps {
  scans: ScanResult[];
}

export function ScanLog({ scans }: ScanLogProps) {
  if (scans.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={40} color={COLORS.text.primary} />
        </View>
        <Text style={styles.emptyText}>Sin escaneos hoy</Text>
        <Text style={styles.emptySubtext}>Los escaneos aparecerán aquí</Text>
      </View>
    );
  }

  const getModeInfo = (mode: string) => {
    switch (mode) {
      case 'entrada':
        return {
          label: 'ENTRADA',
          icon: 'enter-outline' as const,
          iconLib: 'Ionicons' as const,
          description: 'Control de acceso',
        };
      case 'entrega':
        return {
          label: 'ENTREGA',
          icon: 'clipboard-text' as const,
          iconLib: 'MaterialCommunityIcons' as const,
          description: 'Pasaporte entregado',
        };
      default:
        return {
          label: mode.toUpperCase(),
          icon: 'qrcode-scan' as const,
          iconLib: 'MaterialCommunityIcons' as const,
          description: 'Escaneo',
        };
    }
  };

  return (
    <View style={styles.container}>
      {scans.map((scan, index) => {
        const isValid = scan.status === 'valid';
        const modeInfo = getModeInfo(scan.mode);
        
        return (
          <ScanLogItem 
            key={scan.id}
            scan={scan}
            index={index}
            totalScans={scans.length}
            isValid={isValid}
            modeInfo={modeInfo}
          />
        );
      })}
    </View>
  );
}

interface ScanLogItemProps {
  scan: ScanResult;
  index: number;
  totalScans: number;
  isValid: boolean;
  modeInfo: any;
}

function ScanLogItem({ scan, index, totalScans, isValid, modeInfo }: ScanLogItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.logItemWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}>
      {isValid ? (
        <LinearGradient
          colors={[COLORS.neutral.white, COLORS.success.light]}
          style={[styles.logItem, styles.logItemValid]}>
          {/* Header con icono y estado */}
          <View style={styles.logItemHeader}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainerValid}>
                <Ionicons name="checkmark" size={32} color={COLORS.neutral.white} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modeLabel}>{modeInfo.label}</Text>
                <Text style={styles.modeDescription}>{modeInfo.description}</Text>
              </View>
            </View>
            <View style={styles.statusBadgeValid}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
              <Text style={styles.statusTextValid}>VÁLIDO</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Información del escaneo */}
          <View style={styles.infoSection}>
            {scan.name && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person" size={16} color={COLORS.text.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Participante</Text>
                  <Text style={styles.infoValue}>{scan.name}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="qrcode" size={16} color={COLORS.text.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Código QR</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{scan.data}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="time-outline" size={16} color={COLORS.text.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Hora de escaneo</Text>
                <Text style={styles.infoValue}>{scan.timestamp}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="counter" size={16} color={COLORS.text.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Número de escaneo</Text>
                <Text style={styles.infoValue}>#{totalScans - index}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={[COLORS.neutral.white, COLORS.error.light]}
          style={[styles.logItem, styles.logItemInvalid]}>
          {/* Header con icono y estado */}
          <View style={styles.logItemHeader}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainerInvalid}>
                <Ionicons name="close-circle" size={24} color={COLORS.error.main} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modeLabelInvalid}>{modeInfo.label}</Text>
                <Text style={styles.modeDescriptionInvalid}>Error en validación</Text>
              </View>
            </View>
            <View style={styles.statusBadgeInvalid}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error.main} />
              <Text style={styles.statusTextInvalid}>INVÁLIDO</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerInvalid} />

          {/* Información del escaneo */}
          <View style={styles.infoSection}>
            {scan.name && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person" size={16} color="#800080" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Participante</Text>
                  <Text style={styles.infoValue}>{scan.name}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="qrcode" size={16} color="#800080" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Código QR</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{scan.data}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="time-outline" size={16} color="#800080" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Hora de intento</Text>
                <Text style={styles.infoValue}>{scan.timestamp}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="warning-outline" size={16} color={COLORS.error.main} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Motivo</Text>
                <Text style={styles.infoValueError}>QR no válido o ya utilizado</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.secondary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.text.primary,
    opacity: 0.6,
  },
  logItemWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logItem: {
    padding: 16,
  },
  logItemValid: {
    borderWidth: 2,
    borderColor: COLORS.success.border,
    borderRadius: 16,
  },
  logItemInvalid: {
    borderWidth: 2,
    borderColor: COLORS.error.border,
    borderRadius: 16,
  },
  logItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainerValid: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.success.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerInvalid: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.error.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  modeLabelInvalid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error.main,
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 12,
    color: COLORS.text.primary,
    opacity: 0.7,
  },
  modeDescriptionInvalid: {
    fontSize: 12,
    color: COLORS.error.main,
    opacity: 0.7,
  },
  statusBadgeValid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success.border,
  },
  statusBadgeInvalid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error.border,
  },
  statusTextValid: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.success.main,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  statusTextInvalid: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.error.main,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.success.main,
    marginBottom: 12,
    opacity: 0.3,
  },
  dividerInvalid: {
    height: 1,
    backgroundColor: COLORS.error.main,
    marginBottom: 12,
    opacity: 0.3,
  },
  infoSection: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.text.primary,
    opacity: 0.6,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  infoValueError: {
    fontSize: 14,
    color: COLORS.error.main,
    fontWeight: '600',
  },
});
