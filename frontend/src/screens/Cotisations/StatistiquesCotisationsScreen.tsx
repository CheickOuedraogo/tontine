import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator,
    TouchableOpacity, Image
} from 'react-native';
import { theme } from '../../theme';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    CheckCircle2, Clock, AlertCircle, BarChart3, ArrowLeft, Users
} from 'lucide-react-native';

export const StatistiquesCotisationsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const tontineId = route.params?.tontineId;

    const [cotisations, setCotisations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cycleNumero, setCycleNumero] = useState<number | null>(null);

    useEffect(() => {
        loadStatistiques();
    }, [cycleNumero]);

    const loadStatistiques = async () => {
        setIsLoading(true);
        try {
            const url = cycleNumero 
                ? `/cotisations/tontine/${tontineId}?stats=true&cycleNumero=${cycleNumero}`
                : `/cotisations/tontine/${tontineId}?stats=true`;
            const res = await apiClient.get(url);
            setCotisations(res.data.cotisations || []);
        } catch (err) {
            // Error loading stats
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return <CheckCircle2 color="#059669" size={18} />;
            case 'EN_RETARD': return <AlertCircle color="#DC2626" size={18} />;
            default: return <Clock color="#D97706" size={18} />;
        }
    };

    const getStatusInfo = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return { label: 'Payée', bg: '#D1FAE5', color: '#059669' };
            case 'EN_RETARD': return { label: 'En retard', bg: '#FEE2E2', color: '#DC2626' };
            default: return { label: 'En attente', bg: '#FEF3C7', color: '#D97706' };
        }
    };

    // Grouper par cycle
    const cycles = [...new Set(cotisations.map(c => c.cycleNumero))].sort((a, b) => a - b);
    
    // Statistiques globales
    const totalPaid = cotisations.filter(c => c.statut === 'PAYEE').length;
    const totalPending = cotisations.filter(c => c.statut !== 'PAYEE').length;
    const totalAmount = cotisations.filter(c => c.statut === 'PAYEE').reduce((s, c) => s + Number(c.montant), 0);

    const renderCotisation = ({ item }: { item: any }) => {
        const statusInfo = getStatusInfo(item.statut);
        const isPayee = item.statut === 'PAYEE';

        return (
            <View style={styles.cotisationRow}>
                <View style={styles.memberInfo}>
                    {item.membre?.photo ? (
                        <Image 
                            source={{ uri: item.membre.photo.startsWith('http') ? item.membre.photo : `http://localhost:3000${item.membre.photo}` }} 
                            style={styles.avatar} 
                        />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.membre?.prenom?.[0]?.toUpperCase() || 'M'}
                            </Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>
                            {item.membre ? `${item.membre.prenom} ${item.membre.nom}` : 'Membre'}
                        </Text>
                        <Text style={styles.memberEmail}>{item.membre?.email || ''}</Text>
                    </View>
                </View>

                <View style={styles.cotisationDetails}>
                    <Text style={styles.amount}>{Number(item.montant).toLocaleString('fr-FR')} F</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        {getStatusIcon(item.statut)}
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                    {isPayee && item.datePaiement && (
                        <Text style={styles.paidDate}>
                            {new Date(item.datePaiement).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    )}
                    {item.operateur && (
                        <Text style={styles.operateur}>
                            {item.operateur.replace('_', ' ')}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerBg}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#FFFFFF" size={22} />
                </TouchableOpacity>
                <View style={styles.headerIcon}>
                    <BarChart3 color="#FFFFFF" size={24} />
                </View>
                <Text style={styles.headerTitle}>Statistiques Cotisations</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <CheckCircle2 color="#34D399" size={18} />
                        <Text style={styles.statNumber}>{totalPaid}</Text>
                        <Text style={styles.statLabel}>Payées</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Clock color="#FBBF24" size={18} />
                        <Text style={styles.statNumber}>{totalPending}</Text>
                        <Text style={styles.statLabel}>En attente</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Users color="#A78BFA" size={18} />
                        <Text style={styles.statNumber}>{totalAmount > 0 ? totalAmount.toLocaleString('fr-FR') : '0'}</Text>
                        <Text style={styles.statLabel}>FCFA total</Text>
                    </View>
                </View>
            </View>

            {/* Filtres par cycle */}
            <View style={styles.filtersRow}>
                <TouchableOpacity 
                    style={[styles.filterBtn, cycleNumero === null && styles.filterBtnActive]}
                    onPress={() => setCycleNumero(null)}
                >
                    <Text style={[styles.filterText, cycleNumero === null && styles.filterTextActive]}>
                        Tous
                    </Text>
                </TouchableOpacity>
                {cycles.map(cycle => (
                    <TouchableOpacity 
                        key={cycle}
                        style={[styles.filterBtn, cycleNumero === cycle && styles.filterBtnActive]}
                        onPress={() => setCycleNumero(cycle)}
                    >
                        <Text style={[styles.filterText, cycleNumero === cycle && styles.filterTextActive]}>
                            Tour {cycle}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={cotisations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCotisation}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BarChart3 color="#6366F1" size={36} />
                            <Text style={styles.emptyTitle}>Aucune cotisation</Text>
                            <Text style={styles.emptyText}>
                                Les cotisations seront générées une fois la tontine démarrée.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    headerBg: { backgroundColor: '#1E1B4B', padding: 20 },
    backBtn: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 12
    },
    headerIcon: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        backgroundColor: '#6366F1', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 12
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: { 
        flex: 1, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, 
        padding: 12, 
        alignItems: 'center' 
    },
    statNumber: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 4 },
    statLabel: { fontSize: 10, color: '#A5B4FC', marginTop: 2 },
    filtersRow: { 
        flexDirection: 'row', 
        padding: 16, 
        gap: 8, 
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    filterBtn: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20, 
        backgroundColor: '#F1F5F9' 
    },
    filterBtnActive: { backgroundColor: '#6366F1' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    filterTextActive: { color: '#FFFFFF' },
    list: { padding: 16 },
    cotisationRow: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        elevation: 2
    },
    memberInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
    memberName: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
    memberEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
    cotisationDetails: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '800', color: '#1E1B4B', marginBottom: 4 },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 12 
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    paidDate: { fontSize: 10, color: '#64748B', marginTop: 4 },
    operateur: { fontSize: 10, color: '#6366F1', marginTop: 2, fontWeight: '600' },
    emptyContainer: { 
        alignItems: 'center', 
        padding: 40, 
        backgroundColor: '#FFFFFF', 
        borderRadius: 16,
        marginTop: 20
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginTop: 12 },
    emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
