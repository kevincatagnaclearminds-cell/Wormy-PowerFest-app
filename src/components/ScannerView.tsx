import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Mode, ScanResult } from '../types';
import { ResultBanner } from './ResultBanner';
import { QRScanner } from './QRScanner';
import { CustomAlert } from './CustomAlert';
import { AnimatedBackground } from './AnimatedBackground';
import { validateQR, registrarEntrada, registrarEntrega } from '../services/scanService';
import { COLORS } from '../config/colors';

interface ScannerViewProps {
  mode: Mode;
  scans: ScanResult[];
  onScan: (result: ScanResult) => void;
}

export function ScannerView({ mode, scans, onScan }: ScannerViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const spinnerRotate = useRef(new Animated.Value(0)).current;
  
  // Estados para los modales personalizados
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Animación de pulso continuo para el botón
  useEffect(() => {
    if (!isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isScanning]);

  // Animación del spinner cuando está escaneando
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.timing(spinnerRotate, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinnerRotate.setValue(0);
    }
  }, [isScanning]);

  const spin = spinnerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    setLastResult(null);
  }, [mode]);

  const handleScanPress = () => {
    setShowCamera(true);
  };

  const handleQRScanned = async (data: string) => {
    setShowCamera(false);
    setIsScanning(true);

    try {
      // 1. Primero validar el QR
      const validation = await validateQR(data, mode);

      if (!validation.success) {
        // Error de validación
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
        
        const errorResult: ScanResult = {
          id: Date.now().toString(),
          timestamp,
          data: data,
          status: 'invalid',
          mode,
        };

        setLastResult(errorResult);
        onScan(errorResult);
        setIsScanning(false);

        setAlertConfig({
          visible: true,
          type: 'error',
          title: 'Error de Validación',
          message: validation.error?.message || 'QR no válido',
        });
        return;
      }

      // 2. Mostrar información del participante y confirmar
      const participant = validation.data!;
      
      // Verificar si ya está registrado según el modo
      let alertTitle = 'Participante Encontrado';
      let alertMessage = '';
      let alertType: 'confirm' | 'info' = 'confirm';
      
      if (!participant.can_scan) {
        // Ya está registrado
        if (mode === 'entrada' && participant.status.entrada) {
          alertTitle = 'Entrada Ya Registrada';
          alertMessage = `${participant.name}\n\nEsta persona ya registró su entrada al evento anteriormente.`;
          alertType = 'info';
        } else if (mode === 'entrega' && participant.status.entrega) {
          alertTitle = 'Pasaporte Ya Entregado';
          alertMessage = `${participant.name}\n\nEsta persona ya recibió su pasaporte anteriormente.`;
          alertType = 'info';
        } else {
          alertMessage = `${participant.name}\n${participant.email}\n\n${participant.message}`;
        }
      } else {
        // Puede escanear
        const actionText = mode === 'entrada' ? 'registrar la entrada' : 'registrar la entrega del pasaporte';
        alertMessage = `${participant.name}\n${participant.email}\n\n¿Deseas ${actionText}?`;
      }
      
      setAlertConfig({
        visible: true,
        type: alertType,
        title: alertTitle,
        message: alertMessage,
        confirmText: participant.can_scan ? 'Registrar' : 'Aceptar',
        onConfirm: async () => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (participant.can_scan) {
            await processScan(data, participant.name);
          } else {
            setIsScanning(false);
          }
        },
      });
    } catch (error) {
      console.error('Error processing QR:', error);
      setIsScanning(false);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al procesar el QR',
      });
    }
  };

  const processScan = async (qrCode: string, participantName: string) => {
    try {
      let result;

      // Registrar según el modo seleccionado
      if (mode === 'entrada') {
        result = await registrarEntrada(qrCode);
      } else {
        result = await registrarEntrega(qrCode);
      }

      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });

      if (result.success) {
        // Escaneo exitoso
        const successResult: ScanResult = {
          id: Date.now().toString(),
          timestamp,
          data: qrCode,
          status: 'valid',
          mode,
          name: result.data!.name,
        };

        setLastResult(successResult);
        onScan(successResult);

        const formattedTime = new Date(result.data!.timestamp).toLocaleString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        setAlertConfig({
          visible: true,
          type: 'success',
          title: 'Registro Exitoso',
          message: `${result.data!.message}\n\nParticipante: ${result.data!.name}\nHora: ${formattedTime}`,
        });
      } else {
        // Error al registrar
        const errorResult: ScanResult = {
          id: Date.now().toString(),
          timestamp,
          data: qrCode,
          status: 'invalid',
          mode,
          name: participantName,
        };

        setLastResult(errorResult);
        onScan(errorResult);

        setAlertConfig({
          visible: true,
          type: 'error',
          title: 'Error al Registrar',
          message: result.error?.message || 'No se pudo registrar el escaneo',
        });
      }
    } catch (error) {
      console.error('Error in processScan:', error);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al registrar el escaneo',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getModeLabel = (m: Mode) => {
    switch (m) {
      case 'entrada':
        return 'CONTROL DE ENTRADA';
      case 'entrega':
        return 'ENTREGA DE PASAPORTE';
      default:
        return m;
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      {/* View Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>MODO ACTIVO</Text>
        <LinearGradient
          colors={[COLORS.primary.main, COLORS.primary.dark]}
          style={styles.modeBadge}>
          <Text style={styles.modeLabel}>{getModeLabel(mode)}</Text>
        </LinearGradient>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerArea}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={handleScanPress}
            disabled={isScanning}
            activeOpacity={0.8}
            style={styles.scannerButton}>
            <View style={styles.scannerFrame}>
              {/* Corner Accents */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Center Content */}
              <View style={styles.scannerContent}>
                {isScanning ? (
                  <View style={styles.scanningState}>
                    <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                      <LinearGradient
                        colors={[COLORS.primary.main, COLORS.secondary.main]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.spinnerGradient}
                      />
                    </Animated.View>
                    <Text style={styles.scanningText}>PROCESANDO...</Text>
                    <View style={styles.dotsContainer}>
                      <View style={[styles.dot, styles.dotActive]} />
                      <View style={[styles.dot, styles.dotActive]} />
                      <View style={[styles.dot, styles.dotActive]} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.idleState}>
                    <LinearGradient
                      colors={[COLORS.primary.main, COLORS.primary.dark]}
                      style={styles.cameraIcon}>
                      <MaterialCommunityIcons name="qrcode-scan" size={40} color={COLORS.neutral.white} />
                    </LinearGradient>
                    <Text style={styles.scanText}>TOCAR PARA ESCANEAR</Text>
                    <Text style={styles.scanHint}>Presiona para activar la cámara</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Result Area */}
      <View style={styles.resultArea}>
        <ResultBanner result={lastResult} />
      </View>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}>
        <QRScanner
          onScan={handleQRScanned}
          onClose={() => setShowCamera(false)}
        />
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          setIsScanning(false);
        }}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary.light,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.white,
    letterSpacing: -0.5,
  },
  scannerArea: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.background.default,
  },
  scannerButton: {
    width: 280,
    height: 280,
  },
  scannerFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.shadow.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.primary.main,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningState: {
    alignItems: 'center',
  },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
    overflow: 'hidden',
  },
  spinnerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  scanningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary.main,
    letterSpacing: 2,
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral.gray300,
  },
  dotActive: {
    backgroundColor: COLORS.secondary.main,
  },
  idleState: {
    alignItems: 'center',
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  scanText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scanHint: {
    fontSize: 11,
    color: COLORS.text.primary,
    opacity: 0.6,
  },
  resultArea: {
    marginBottom: 16,
  },
});
