import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react-native';

interface Payment {
    id: string;
    montant: number;
    statut: string;
    datePaiement: string;
    datePrevue: string;
    cycleNumero?: number;
    methode?: string;
}

const STATUS_FR: Record<string, string> = {
    PAYEE: 'Payé',
    EN_ATTENTE: 'En attente',
    EN_RETARD: 'En retard',
    ANNULEE: 'Annulé',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PAYEE: { bg: '#D1FAE5', text: '#059669' },
    EN_ATTENTE: { bg: '#FEF3C7', text: '#D97706' },
    EN_RETARD: { bg: '#FEE2E2', text: '#DC2626' },
    ANNULEE: { bg: '#F1F5F9', text: '#64748B' },
};

export const PaymentHistoryScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId } = route.params;

    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const res = await apiClient.get(`/cotisations/tontine/${tontineId}`);
            const data = res.data.cotisations || res.data.data || res.data;
            setPayments(Array.isArray(data) ? data : []);
        } catch {
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPaid = payments.filter(p => p.statut === 'PAYEE').reduce((s, p) => s + Number(p.montant), 0);
    const totalPending = payments.filter(p => p.statut !== 'PAYEE').reduce((s, p) => s + Number(p.montant), 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Historique paiements</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <TrendingUp color="#34D399" size={16} />
                        <Text style={styles.statAmount}>{totalPaid.toLocaleString('fr-FR')} F</Text>
                        <Text style={styles.statLabel}>Payé</Text>
                    </View>
                    <View style={styles.statCard}>
                        <TrendingDown color="#FBBF24" size={16} />
                        <Text style={styles.statAmount}>{totalPending.toLocaleString('fr-FR')} F</Text>
                        <Text style={styles.statLabel}>En attente</Text>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const colors = STATUS_COLORS[item.statut] || STATUS_COLORS.EN_ATTENTE;
                        return (
                            <View style={styles.paymentCard}>
                                <View style={[styles.accentBar, { backgroundColor: colors.text }]} />
                                <View style={styles.paymentContent}>
                                    <View style={styles.paymentTop}>
                                        <Text style={styles.paymentAmount}>
                                            {Number(item.montant).toLocaleString('fr-FR')} FCFA
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                            <Text style={[styles.statusText, { color: colors.text }]}>
                                                {STATUS_FR[item.statut] || item.statut}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.paymentDate}>
                                        {item.datePaiement
                                            ? new Date(item.datePaiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : `Prévu le ${new Date(item.datePrevue || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                                        }
                                        {item.cycleNumero ? `  •  Cycle ${item.cycleNumero}` : ''}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Wallet color="#6366F1" size={32} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucun paiement</Text>
                            <Text style={styles.emptyText}>L'historique apparaîtra ici une fois les cycles démarrés.</Text>
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
    // List
    list: { padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
    paymentCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 10, overflow: 'hidden', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
    accentBar: { width: 4 },
    paymentContent: { flex: 1, padding: 14 },
    paymentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    paymentAmount: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700' },
    paymentDate: { fontSize: 12, color: '#64748B' },
    // Empty
    emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 24px rgba(0,0,0,0.06)', elevation: 3, marginTop: 8 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
    emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center' },
});
