import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Award, Calendar, User, TrendingUp, Wallet } from 'lucide-react-native';

interface Distribution {
    id: string;
    tontineId: string;
    beneficiaireId: string;
    montantBrut: number;
    montantFrais: number;
    montantNet: number;
    datePrevue: string;
    dateEffective: string | null;
    cycleNumero: number;
    statut: string;
    nom: string;
    prenom: string;
}

const STATUS_FR: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    EFFECTUEE: 'Effectuée',
    ANNULEE: 'Annulée',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    EN_ATTENTE: { bg: '#FEF3C7', text: '#D97706' },
    EFFECTUEE: { bg: '#D1FAE5', text: '#059669' },
    ANNULEE: { bg: '#F1F5F9', text: '#64748B' },
};

export const DistributionScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId } = route.params;

    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDistributions();
    }, []);

    const loadDistributions = async () => {
        try {
            const res = await apiClient.get(`/distributions/tontine/${tontineId}`);
            const data = res.data.distributions || res.data.data || res.data;
            setDistributions(Array.isArray(data) ? data : []);
        } catch {
            setDistributions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const totalDistributed = distributions
        .filter(d => d.statut === 'EFFECTUEE')
        .reduce((s, d) => s + Number(d.montantNet), 0);

    const nextDistribution = distributions.find(d => d.statut === 'EN_ATTENTE');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Distributions</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <TrendingUp color="#34D399" size={16} />
                        <Text style={styles.statAmount}>{totalDistributed.toLocaleString('fr-FR')} F</Text>
                        <Text style={styles.statLabel}>Distribué</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Calendar color="#FBBF24" size={16} />
                        <Text style={styles.statAmount}>{distributions.length}</Text>
                        <Text style={styles.statLabel}>Tours prévus</Text>
                    </View>
                </View>
            </View>

            {/* Next distribution banner */}
            {nextDistribution && (
                <View style={styles.nextBanner}>
                    <Award color="#6366F1" size={20} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.nextLabel}>Prochain bénéficiaire</Text>
                        <Text style={styles.nextName}>
                            {nextDistribution.prenom} {nextDistribution.nom} — Tour {nextDistribution.cycleNumero}
                        </Text>
                    </View>
                    <Text style={styles.nextAmount}>
                        {Number(nextDistribution.montantNet).toLocaleString('fr-FR')} F
                    </Text>
                </View>
            )}

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={distributions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const colors = STATUS_COLORS[item.statut] || STATUS_COLORS.EN_ATTENTE;
                        return (
                            <View style={styles.card}>
                                <View style={[styles.accentBar, { backgroundColor: colors.text }]} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardTop}>
                                        <View style={styles.tourCircle}>
                                            <Text style={styles.tourNum}>{item.cycleNumero}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.benefName}>{item.prenom} {item.nom}</Text>
                                            <Text style={styles.dateText}>
                                                {new Date(item.datePrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                            <Text style={[styles.statusText, { color: colors.text }]}>
                                                {STATUS_FR[item.statut] || item.statut}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.amountsRow}>
                                        <View style={styles.amountItem}>
                                            <Text style={styles.amountLabel}>Montant</Text>
                                            <Text style={[styles.amountVal, { color: '#059669', fontWeight: '900' }]}>{Number(item.montantNet).toLocaleString('fr-FR')} F</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Wallet color="#6366F1" size={32} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucune distribution</Text>
                            <Text style={styles.emptyText}>
                                Les distributions seront planifiées{'\n'}au démarrage de la tontine.
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
    // Header
    header: { backgroundColor: '#1E1B4B', paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statAmount: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 4 },
    statLabel: { fontSize: 10, color: '#A5B4FC', marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    // Next banner
    nextBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#EEF2FF',
        margin: 16,
        marginBottom: 0,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    nextLabel: { fontSize: 10, color: '#6366F1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    nextName: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 2 },
    nextAmount: { fontSize: 16, fontWeight: '900', color: '#6366F1' },
    // List
    list: { padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
    card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
    accentBar: { width: 4 },
    cardContent: { flex: 1, padding: 14 },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    tourCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    tourNum: { fontSize: 14, fontWeight: '900', color: '#6366F1' },
    benefName: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
    dateText: { fontSize: 12, color: '#64748B', marginTop: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700' },
    amountsRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
    amountItem: { flex: 1, alignItems: 'center' },
    amountLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
    amountVal: { fontSize: 13, fontWeight: '700', color: '#1E1B4B' },
    // Empty
    emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 24px rgba(0,0,0,0.06)', elevation: 3, marginTop: 8 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
    emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
