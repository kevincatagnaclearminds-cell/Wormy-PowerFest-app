import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>Cargando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#B50095', '#800080']}
          style={styles.permissionIcon}>
          <MaterialCommunityIcons name="camera" size={50} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
        <Text style={styles.permissionText}>
          Necesitamos acceso a tu cámara para escanear códigos QR
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButtonContainer}>
          <LinearGradient
            colors={['#B50095', '#800080']}
            style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>PERMITIR CÁMARA</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Overlay */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            {/* Animated corners */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            
            {scanned && (
              <View style={styles.scannedOverlay}>
                <LinearGradient
                  colors={['#FCD34D', '#F59E0B']}
                  style={styles.scannedIcon}>
                  <Ionicons name="checkmark" size={50} color="#800080" />
                </LinearGradient>
              </View>
            )}
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <View style={styles.instructionContainer}>
            {scanned ? (
              <>
                <Text style={styles.instructionTitle}>¡Escaneado!</Text>
                <Text style={styles.instructionText}>Procesando código...</Text>
              </>
            ) : (
              <>
                <Text style={styles.instructionTitle}>Escanear Código QR</Text>
                <Text style={styles.instructionText}>
                  Apunta al código dentro del marco
                </Text>
              </>
            )}
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 64,
    height: 64,
    borderWidth: 4,
    borderColor: '#B50095',
    borderTopColor: 'transparent',
    borderRadius: 32,
    marginBottom: 16,
  },
  loadingText: {
    color: '#800080',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#B50095',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B50095',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#800080',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButtonContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#B50095',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#800080',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scanArea: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: '#FCD34D',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(95, 251, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  closeButtonText: {
    color: '#800080',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
