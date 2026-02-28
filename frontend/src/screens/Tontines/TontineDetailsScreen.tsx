import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { useTontineStore } from '../../store/useTontineStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import {
    Wallet, Users, MessageCircle, FileText, Settings, Clock,
    ArrowLeft, CreditCard, BarChart3, UserPlus, Info
} from 'lucide-react-native';

export const TontineDetailsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;
    const user = useAuthStore(state => state.user);

    const { currentTontine, isLoading, fetchTontineDetails, demanderDeblocage, validerDeblocage, quitterEtRetirer } = useTontineStore();
    const [membresCount, setMembresCount] = useState(0);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadData = useCallback(() => {
        fetchTontineDetails(id);
        apiClient.get(`/tontines/${id}/membres`).then(res => {
            const m = res.data.membres || res.data.data || [];
            setMembresCount(Array.isArray(m) ? m.length : 0);
        }).catch(() => { });
    }, [id]);

    useFocusEffect(loadData);

    const handleDemanderDeblocage = async () => {
        Alert.alert('Déblocage', 'Voulez-vous vraiment demander le déblocage des fonds ? Tous les membres devront valider.', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', onPress: () => demanderDeblocage(id) }
        ]);
    };

    const handleValider = (v: boolean) => {
        const msg = v ? 'Voulez-vous valider le déblocage ?' : 'Si vous refusez, vous devrez quitter la tontine et retirer vos fonds.';
        Alert.alert(v ? 'Valider' : 'Refuser', msg, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Confirmer', onPress: async () => {
                    if (v) await validerDeblocage(id, true);
                    else {
                        await quitterEtRetirer(id);
                        navigation.navigate('Tontines');
                    }
                }
            }
        ]);
    };

    if (isLoading || !currentTontine) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const isCreator = currentTontine.creatorId === user?.id;
    const freqLabels: Record<string, string> = {
        QUOTIDIENNE: 'Quotidienne', HEBDOMADAIRE: 'Hebdomadaire',
        MENSUELLE: 'Mensuelle', TRIMESTRIELLE: 'Trimestrielle',
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with tontine name */}
            <View style={styles.headerBg}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={theme.colors.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{currentTontine.nom}</Text>
                <View style={[styles.statusBadge, {
                    backgroundColor: currentTontine.statut === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.2)'
                }]}>
                    <Text style={styles.statusText}>{currentTontine.statut}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Info Summary */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Wallet color={theme.colors.primary} size={20} />
                        <Text style={styles.statValue}>{Number(currentTontine.montantCotisation).toLocaleString('fr-FR')} F</Text>
                        <Text style={styles.statLabel}>Cotisation</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Clock color={theme.colors.warning} size={20} />
                        <Text style={styles.statValue}>{freqLabels[currentTontine.frequence]}</Text>
                        <Text style={styles.statLabel}>Fréquence</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Users color={theme.colors.success} size={20} />
                        <Text style={styles.statValue}>{membresCount}/{currentTontine.nbMembresAttendu}</Text>
                        <Text style={styles.statLabel}>Membres</Text>
                    </View>
                </View>

                {/* Additional Details for ACHAT_COMMUN */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Info size={18} color="#6366F1" />
                        <Text style={styles.infoText}>
                            Type: <Text style={{ fontWeight: 'bold' }}>{currentTontine.type === 'ACHAT_COMMUN' ? '🛍️ Achat Commun' : '♻️ Classique'}</Text>
                        </Text>
                    </View>
                    {currentTontine.type === 'ACHAT_COMMUN' && (
                        <View style={[styles.infoRow, { marginTop: 8 }]}>
                            <CreditCard size={18} color="#059669" />
                            <Text style={styles.infoText}>
                                Déblocage: <Text style={{ fontWeight: 'bold' }}>{currentTontine.statutDeblocage}</Text>
                            </Text>
                        </View>
                    )}
                </View>

                {/* Unlocking Actions */}
                {currentTontine.type === 'ACHAT_COMMUN' && (
                    <View style={styles.actionSection}>
                        {isCreator && currentTontine.statutDeblocage === 'NON_DEMANDE' && (
                            <Button title="🚀 Demander le Déblocage" onPress={handleDemanderDeblocage} />
                        )}
                        {currentTontine.statutDeblocage === 'EN_ATTENTE' && (
                            <View style={{ gap: 10 }}>
                                <Text style={styles.waitingText}>💡 Le créateur demande le déblocage des fonds. Votre avis est requis.</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <Button title="✅ Valider" onPress={() => handleValider(true)} style={{ flex: 1 }} />
                                    <Button title="❌ Refuser & Quitter" variant="danger" onPress={() => handleValider(false)} style={{ flex: 1 }} />
                                </View>
                            </View>
                        )}
                        {currentTontine.statutDeblocage === 'VALIDE' && (
                            <View style={styles.successBox}>
                                <Text style={styles.successText}>🎉 Déblocage validé par tous les membres !</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Grid */}
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionsGrid}>
                    <ActionCard
                        icon={<CreditCard color="#6366F1" size={24} />}
                        title="Cotisations"
                        subtitle="Payer / voir les cycles"
                        onPress={() => navigation.navigate('Cotisations', { tontineId: id })}
                    />
                    <ActionCard
                        icon={<BarChart3 color="#059669" size={24} />}
                        title="Historique"
                        subtitle="Paiements effectués"
                        onPress={() => navigation.navigate('PaymentHistory', { tontineId: id })}
                    />
                    <ActionCard
                        icon={<Wallet color="#D97706" size={24} />}
                        title="Distributions"
                        subtitle="Cagnottes versées"
                        onPress={() => navigation.navigate('Distribution', { tontineId: id })}
                    />
                    <ActionCard
                        icon={<FileText color="#64748B" size={24} />}
                        title="Contrat"
                        subtitle="Signer le contrat"
                        onPress={() => navigation.navigate('Contrat', { tontineId: id })}
                    />
                    <ActionCard
                        icon={<MessageCircle color="#F59E0B" size={24} />}
                        title="Chat"
                        subtitle="Discussion du groupe"
                        onPress={() => navigation.navigate('Chat', { tontineId: id, tontineName: currentTontine.nom })}
                    />
                    {isCreator && (
                        <ActionCard
                            icon={<UserPlus color="#6366F1" size={24} />}
                            title="Inviter"
                            subtitle="Ajouter des membres"
                            onPress={() => navigation.navigate('InviteMembers', { tontineId: id, tontineName: currentTontine.nom })}
                        />
                    )}
                    {isCreator && (
                        <ActionCard
                            icon={<Settings color="#EF4444" size={24} />}
                            title="Admin"
                            subtitle="Gérer la tontine"
                            onPress={() => navigation.navigate('AdminTontine', { tontineId: id, tontineName: currentTontine.nom })}
                        />
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const ActionCard = ({ icon, title, subtitle, onPress }: { icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
        {icon}
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBg: { backgroundColor: '#1E1B4B', padding: 18, paddingTop: 20, alignItems: 'center' },
    backBtn: { position: 'absolute', left: 16, top: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    statusText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
    scrollContent: { padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, alignItems: 'center', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
    statValue: { fontSize: 14, fontWeight: '900', color: '#1E1B4B', marginTop: 4, textAlign: 'center' },
    statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    actionCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, alignItems: 'center', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
    actionTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginTop: 8 },
    actionSubtitle: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 2 },
    infoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#6366F1', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { fontSize: 14, color: '#1E1B4B' },
    actionSection: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#C7D2FE' },
    waitingText: { fontSize: 13, color: '#4338CA', fontWeight: '600', marginBottom: 12, lineHeight: 18 },
    successBox: { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
    successText: { color: '#065F46', fontWeight: 'bold', fontSize: 14 },
});
