import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScanResult, Mode } from '../types';
import { ScanLog } from './ScanLog';
import { AnimatedBackground } from './AnimatedBackground';

interface HistoryViewProps {
  scans: ScanResult[];
}

export function HistoryView({ scans }: HistoryViewProps) {
  const [filterMode, setFilterMode] = useState<Mode | 'all'>('all');

  // Filtrar escaneos por modo
  const filteredScans = filterMode === 'all' 
    ? scans 
    : scans.filter(scan => scan.mode === filterMode);

  // Calcular estadísticas
  const totalScans = scans.length;
  const validScans = scans.filter(s => s.status === 'valid').length;
  const invalidScans = scans.filter(s => s.status === 'invalid').length;
  const entradaScans = scans.filter(s => s.mode === 'entrada').length;
  const entregaScans = scans.filter(s => s.mode === 'entrega').length;

  const filters: Array<{ id: Mode | 'all'; label: string; icon: string; iconLib: 'Ionicons' | 'MaterialCommunityIcons' }> = [
    { id: 'all', label: 'TODOS', icon: 'apps', iconLib: 'Ionicons' },
    { id: 'entrada', label: 'ENTRADA', icon: 'enter-outline', iconLib: 'Ionicons' },
    { id: 'entrega', label: 'ENTREGA', icon: 'clipboard-text-outline', iconLib: 'MaterialCommunityIcons' },
  ];

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Escaneos</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>FILTRAR POR:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {filters.map((filter) => {
            const isActive = filterMode === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setFilterMode(filter.id)}
                activeOpacity={0.7}
                style={styles.filterButtonContainer}>
                {isActive ? (
                  <LinearGradient
                    colors={['#B50095', '#800080']}
                    style={styles.filterButton}>
                    {filter.iconLib === 'Ionicons' ? (
                      <Ionicons name={filter.icon as any} size={16} color="#FFFFFF" />
                    ) : (
                      <MaterialCommunityIcons name={filter.icon as any} size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.filterTextActive}>{filter.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterButtonInactive}>
                    {filter.iconLib === 'Ionicons' ? (
                      <Ionicons name={filter.icon as any} size={16} color="#800080" />
                    ) : (
                      <MaterialCommunityIcons name={filter.icon as any} size={16} color="#800080" />
                    )}
                    <Text style={styles.filterTextInactive}>{filter.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de escaneos */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filterMode === 'all' ? 'Todos los escaneos' : `Escaneos de ${filterMode}`}
        </Text>
        <Text style={styles.listCount}>
          {filteredScans.length} {filteredScans.length === 1 ? 'registro' : 'registros'}
        </Text>
      </View>

      <ScrollView style={styles.listContainer}>
        <ScanLog scans={filteredScans} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B50095',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#800080',
    textTransform: 'capitalize',
    opacity: 0.7,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 4,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    width: 85,
    height: 85,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardValid: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  statCardInvalid: {
    backgroundColor: '#FFE5F3',
    borderWidth: 2,
    borderColor: '#B50095',
  },
  statCardNeutral: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 1,
  },
  statValueDark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800080',
    marginTop: 2,
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statLabelDark: {
    fontSize: 9,
    color: '#800080',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filtersContainer: {
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#800080',
    paddingHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 1,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterButtonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  filterTextActive: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  filterTextInactive: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#800080',
    letterSpacing: 0.3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B50095',
    textTransform: 'capitalize',
  },
  listCount: {
    fontSize: 11,
    color: '#800080',
    opacity: 0.6,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
