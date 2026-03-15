import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView, Modal } from 'react-native';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { useTontineStore } from '../../store/useTontineStore';
import { Search, Users, Wallet, Calendar, Globe, UserPlus, FileText, X, CheckSquare, Square } from 'lucide-react-native';

interface OpenTontine {
    id: string;
    nom: string;
    montantCotisation: number;
    frequence: string;
    dureeTotale: number;
    nbMembresAttendu: number;
    nbMembresActuel: number;
    creatorNom: string;
    creatorPrenom: string;
    pourcentageFrais: number;
    estMembre: boolean;
}

const FREQ_FR: Record<string, string> = {
    QUOTIDIENNE: 'Quotidienne',
    HEBDOMADAIRE: 'Hebdomadaire',
    MENSUELLE: 'Mensuelle',
    TRIMESTRIELLE: 'Trimestrielle',
};

export const ExploreTontinesScreen = () => {
    const navigation = useNavigation<any>();
    const { fetchMyTontines } = useTontineStore();
    const [tontines, setTontines] = useState<OpenTontine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Contract modal state
    const [showContract, setShowContract] = useState(false);
    const [contractText, setContractText] = useState('');
    const [contractLoading, setContractLoading] = useState(false);
    const [selectedTontine, setSelectedTontine] = useState<OpenTontine | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        loadOpen();
    }, []);

    const loadOpen = async () => {
        try {
            const res = await apiClient.get('/tontines/open');
            const data = res.data.tontines || res.data.data || res.data;
            setTontines(Array.isArray(data) ? data : []);
        } catch {
            setTontines([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOpen();
    }, []);

    // Step 1: Click "Rejoindre" → fetch contract → show modal
    const handleShowContract = async (tontine: OpenTontine) => {
        setSelectedTontine(tontine);
        setAccepted(false);
        setContractLoading(true);
        setShowContract(true);

        try {
            const res = await apiClient.get(`/contrats/tontine/${tontine.id}/preview`);
            const contrat = res.data.contrat;
            if (contrat && contrat.texteContrat) {
                setContractText(contrat.texteContrat);
            } else {
                setContractText('');
            }
        } catch {
            setContractText('');
        } finally {
            setContractLoading(false);
        }
    };

    // Step 2: Accept contract + join
    const handleConfirmJoin = async () => {
        if (!selectedTontine || !accepted) return;
        setJoining(true);
        try {
            await apiClient.post(`/tontines/${selectedTontine.id}/join`);
            setShowContract(false);
            fetchMyTontines();
            alert('🎉 Vous avez rejoint la tontine et signé le contrat !');
            navigation.navigate('TontineDetails', { id: selectedTontine.id });
        } catch (err: any) {
            alert('❌ ' + (err.response?.data?.message || 'Impossible de rejoindre cette tontine.'));
        } finally {
            setJoining(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Globe color="#FFFFFF" size={22} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Explorer</Text>
                    <Text style={styles.headerSubtitle}>
                        {tontines.length} tontine{tontines.length !== 1 ? 's' : ''} disponible{tontines.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={tontines}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
                    renderItem={({ item }) => {
                        const spotsLeft = item.nbMembresAttendu - item.nbMembresActuel;
                        return (
                            <View style={styles.card}>
                                <View style={styles.cardAccent} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardTop}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.tontineName}>{item.nom}</Text>
                                            <Text style={styles.creatorText}>Par {item.creatorPrenom} {item.creatorNom}</Text>
                                        </View>
                                        <View style={styles.spotsBadge}>
                                            <Text style={styles.spotsText}>{spotsLeft} place{spotsLeft !== 1 ? 's' : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Wallet color="#6366F1" size={14} />
                                            <Text style={styles.statValue}>{Number(item.montantCotisation).toLocaleString('fr-FR')} F</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Calendar color="#D97706" size={14} />
                                            <Text style={styles.statValue}>{FREQ_FR[item.frequence] || item.frequence}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Users color="#059669" size={14} />
                                            <Text style={styles.statValue}>{item.nbMembresActuel}/{item.nbMembresAttendu}</Text>
                                        </View>
                                    </View>
                                    {item.estMembre ? (
                                        <View style={styles.memberBadge}>
                                            <Text style={styles.memberBadgeText}>✓ Déjà membre</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.joinBtn} onPress={() => handleShowContract(item)} activeOpacity={0.7}>
                                            <FileText color="#FFFFFF" size={16} />
                                            <Text style={styles.joinBtnText}>Lire le contrat et rejoindre</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Search color="#A5B4FC" size={32} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucune tontine disponible</Text>
                            <Text style={styles.emptyText}>
                                Il n'y a pas de tontines ouvertes{'\n'}pour le moment. Revenez plus tard !
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Contract Modal */}
            <Modal visible={showContract} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <FileText color="#6366F1" size={20} />
                            <Text style={styles.modalTitle}>Contrat de la tontine</Text>
                            <TouchableOpacity onPress={() => setShowContract(false)} style={styles.modalClose}>
                                <X color="#64748B" size={20} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>{selectedTontine?.nom}</Text>

                        {/* Contract Content */}
                        <ScrollView style={styles.contractScroll} contentContainerStyle={styles.contractContent}>
                            {contractLoading ? (
                                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
                            ) : contractText ? (
                                <Text style={styles.contractTextContent}>{contractText}</Text>
                            ) : (
                                <View style={styles.noContract}>
                                    <Text style={styles.noContractText}>
                                        ⚠️ Aucun contrat n'a été généré pour cette tontine.{'\n'}
                                        Contactez le créateur pour qu'il génère le contrat avant de rejoindre.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Accept checkbox + Join button */}
                        {contractText ? (
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setAccepted(!accepted)}
                                    activeOpacity={0.7}
                                >
                                    {accepted ? (
                                        <CheckSquare color="#059669" size={22} />
                                    ) : (
                                        <Square color="#94A3B8" size={22} />
                                    )}
                                    <Text style={styles.checkboxText}>
                                        J'ai lu et j'accepte les conditions du contrat
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, !accepted && styles.confirmBtnDisabled]}
                                    onPress={handleConfirmJoin}
                                    disabled={!accepted || joining}
                                    activeOpacity={0.7}
                                >
                                    {joining ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <>
                                            <UserPlus color="#FFFFFF" size={16} />
                                            <Text style={styles.confirmBtnText}>Signer et rejoindre la tontine</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    header: { backgroundColor: '#1E1B4B', flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
    headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 12, color: '#A5B4FC', marginTop: 2 },
    list: { padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
    card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 14, overflow: 'hidden', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3 },
    cardAccent: { width: 5, backgroundColor: '#6366F1' },
    cardContent: { flex: 1, padding: 16 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    tontineName: { fontSize: 16, fontWeight: '800', color: '#1E1B4B' },
    creatorText: { fontSize: 12, color: '#64748B', marginTop: 2 },
    spotsBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    spotsText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
    memberBadge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#D1FAE5', borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: '#A7F3D0' },
    memberBadgeText: { color: '#059669', fontWeight: '700', fontSize: 14 },
    joinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#6366F1', borderRadius: 10, paddingVertical: 10 },
    joinBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 24px rgba(0,0,0,0.06)', elevation: 3, marginTop: 20 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
    emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', lineHeight: 18 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
    modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    modalSubtitle: { fontSize: 13, color: '#6366F1', fontWeight: '600', paddingHorizontal: 16, paddingTop: 8 },
    contractScroll: { maxHeight: 350 },
    contractContent: { padding: 16 },
    contractTextContent: { fontSize: 13, color: '#374151', lineHeight: 20, backgroundColor: '#FFFBEB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' },
    noContract: { padding: 20, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
    noContractText: { fontSize: 13, color: '#991B1B', textAlign: 'center', lineHeight: 20 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    checkboxText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', borderRadius: 12, paddingVertical: 14 },
    confirmBtnDisabled: { backgroundColor: '#CBD5E1' },
    confirmBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
