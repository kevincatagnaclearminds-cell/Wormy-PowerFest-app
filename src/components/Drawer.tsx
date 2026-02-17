import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Mode } from '../types';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85 > 350 ? 350 : width * 0.85;

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: Mode | null;
  onSelectMode: (mode: Mode) => void;
  onViewHistory: () => void;
}

export function Drawer({
  isOpen,
  onClose,
  activeMode,
  onSelectMode,
  onViewHistory,
}: DrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const menuItems: { 
    id: Mode; 
    label: string; 
    iconName: string;
    iconLibrary: 'Ionicons' | 'MaterialCommunityIcons';
    description: string;
  }[] = [
    { 
      id: 'entrada', 
      label: 'ENTRADA', 
      iconName: 'enter-outline',
      iconLibrary: 'Ionicons',
      description: 'Control de acceso al evento'
    },
    { 
      id: 'entrega', 
      label: 'ENTREGA DE PASAPORTE', 
      iconName: 'clipboard-text-outline',
      iconLibrary: 'MaterialCommunityIcons',
      description: 'Registro de entrega'
    },
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Backdrop animado */}
        <Animated.View 
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            }
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer Panel animado */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            }
          ]}>
          {/* Header con gradiente */}
          <LinearGradient
            colors={['#B50095', '#800080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View style={styles.headerContent}>
              <Image 
                source={require('../../assets/logo-header.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close menu">
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.menuTitleContainer}>
            <Text style={styles.menuSubtitle}>Selecciona una opción</Text>
            <Text style={styles.menuTitle}>Menú Principal</Text>
          </View>

          {/* Menu Items con animación escalonada */}
          <ScrollView 
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}>
            
            {/* Sección: Modos de Escaneo */}
            <Text style={styles.sectionTitle}>MODOS DE ESCANEO</Text>
            
            {menuItems.map((item) => {
              const isActive = activeMode === item.id;
              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.menuItemWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      onSelectMode(item.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={styles.menuItemContainer}>
                    {isActive ? (
                      <LinearGradient
                        colors={['#B50095', '#800080']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                          <View style={styles.iconContainerActive}>
                            {item.iconLibrary === 'Ionicons' ? (
                              <Ionicons name={item.iconName as any} size={28} color="#FFFFFF" />
                            ) : (
                              <MaterialCommunityIcons name={item.iconName as any} size={28} color="#FFFFFF" />
                            )}
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.menuItemTextActive}>
                              {item.label}
                            </Text>
                            <Text style={styles.descriptionActive}>
                              {item.description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.menuItemInactive}>
                        <View style={styles.menuItemLeft}>
                          <View style={styles.iconContainerInactive}>
                            {item.iconLibrary === 'Ionicons' ? (
                              <Ionicons name={item.iconName as any} size={28} color="#800080" />
                            ) : (
                              <MaterialCommunityIcons name={item.iconName as any} size={28} color="#800080" />
                            )}
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.menuItemText}>
                              {item.label}
                            </Text>
                            <Text style={styles.description}>
                              {item.description}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FCD34D" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Sección: Otras Opciones */}
            <Text style={styles.sectionTitle}>OTRAS OPCIONES</Text>

            {/* Opción de Historial */}
            <Animated.View
              style={[
                styles.menuItemWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <TouchableOpacity
                onPress={onViewHistory}
                activeOpacity={0.7}
                style={styles.menuItemContainer}>
                <View style={styles.menuItemInactive}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainerInactive}>
                      <MaterialCommunityIcons name="history" size={28} color="#800080" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.menuItemText}>HISTORIAL</Text>
                      <Text style={styles.description}>Ver todos los escaneos</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FCD34D" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Sistema en línea</Text>
            </View>
            <Text style={styles.versionText}>v1.0.4 • Build 294</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 0, 128, 0.6)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: 40,
    width: 150,
    tintColor: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FCD34D',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#800080',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#800080',
    opacity: 0.6,
  },
  menuTitleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#800080',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: '600',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B50095',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItemWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuItemContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#B50095',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  menuItemInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainerActive: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerInactive: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTextActive: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#B50095',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  descriptionActive: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  description: {
    fontSize: 12,
    color: '#800080',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#800080',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    letterSpacing: 1,
    opacity: 0.6,
  },
});
