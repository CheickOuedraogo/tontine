import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Settings, Users, ArrowLeft, UserMinus, ChevronUp, ChevronDown, Save } from 'lucide-react-native';
import { tontineApi } from '../../api/tontine';
import { useAuthStore } from '../../store/useAuthStore';

export const AdminTontineScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId, tontineName } = route.params;
    const currentUser = useAuthStore(state => state.user);

    const [tontine, setTontine] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [orderChanged, setOrderChanged] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tRes, mRes] = await Promise.all([
                apiClient.get(`/tontines/${tontineId}`),
                apiClient.get(`/tontines/${tontineId}/membres`).catch(() => ({ data: { membres: [] } })),
            ]);
            setTontine(tRes.data.tontine || tRes.data);
            const loadedMembers = mRes.data.membres || mRes.data.data || [];
            // Trier par ordreDistribution si défini, sinon par dateAdhesion
            loadedMembers.sort((a: any, b: any) => {
                if (a.ordreDistribution && b.ordreDistribution) {
                    return a.ordreDistribution - b.ordreDistribution;
                }
                return 0;
            });
            setMembers(loadedMembers);
        } catch (err) {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async () => {
        try {
            await apiClient.post(`/tontines/${tontineId}/start`, {});
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Impossible de démarrer.';
            window.alert('Erreur: ' + msg);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            await tontineApi.removeMember(tontineId, userId);
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Impossible de retirer le membre.';
            window.alert('Erreur: ' + msg);
        }
    };

    const moveMember = (index: number, direction: 'up' | 'down') => {
        const newMembers = [...members];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newMembers.length) return;
        
        [newMembers[index], newMembers[targetIndex]] = [newMembers[targetIndex], newMembers[index]];
        setMembers(newMembers);
        setOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const ordre = members.map((m, i) => ({
                userId: m.userId,
                ordre: i + 1,
            }));
            await tontineApi.updateMembresOrdre(tontineId, ordre);
            setOrderChanged(false);
            window.alert('Ordre de distribution mis à jour !');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Impossible de sauvegarder l\'ordre.';
            window.alert('Erreur: ' + msg);
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
    }

    const membersCount = Array.isArray(members) ? members.length : 0;
    const membersReady = membersCount >= (tontine?.nbMembresAttendu || 0);
    const isCreator = String(currentUser?.id) === String(tontine?.creatorId);
    const isEnAttente = tontine?.statut === 'EN_ATTENTE';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerBg}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <Settings color="#FFFFFF" size={22} />
                <Text style={styles.headerTitle}>Administration</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tontineName}>{tontineName || tontine?.nom}</Text>

                {/* Status Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Statut</Text>
                    <View style={[styles.statusBadge, { backgroundColor: tontine?.statut === 'ACTIVE' ? theme.colors.successLight : theme.colors.primaryLight }]}>
                        <Text style={[styles.statusText, { color: tontine?.statut === 'ACTIVE' ? theme.colors.success : theme.colors.primaryDark }]}>
                            {tontine?.statut || 'EN_ATTENTE'}
                        </Text>
                    </View>

                    {isEnAttente && isCreator && (
                        <>
                            <TouchableOpacity
                                style={styles.startBtn}
                                onPress={handleStart}
                            >
                                <Text style={styles.startBtnText}>
                                    Démarrer la Tontine
                                </Text>
                            </TouchableOpacity>
                            {!membersReady && (
                                <Text style={styles.prerequisiteText}>
                                    Il faut {tontine?.nbMembresAttendu} membres (actuellement {membersCount}).
                                </Text>
                            )}
                        </>
                    )}
                </View>

                {/* Members with Reorder */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Membres ({membersCount} / {tontine?.nbMembresAttendu || '?'})</Text>
                        {isCreator && (
                            <Button
                                title="Inviter"
                                variant="secondary"
                                onPress={() => navigation.navigate('InviteMembers', { tontineId, tontineName: tontine?.nom })}
                                style={styles.miniBtn}
                            />
                        )}
                    </View>

                    {/* Indicateur d'ordre de distribution */}
                    {isCreator && isEnAttente && membersCount > 1 && (
                        <View style={styles.orderHint}>
                            <Text style={styles.orderHintText}>
                                Utilisez les flèches pour modifier l'ordre de distribution
                            </Text>
                        </View>
                    )}

                    {Array.isArray(members) && members.length > 0 ? (
                        members.map((m: any, i: number) => (
                            <View key={m.userId || i} style={styles.memberRow}>
                                {/* Numéro d'ordre */}
                                <View style={styles.orderBadge}>
                                    <Text style={styles.orderBadgeText}>{i + 1}</Text>
                                </View>
                                
                                <View style={styles.memberAvatar}>
                                    {m.photo ? (
                                        <Image 
                                            source={{ uri: m.photo.startsWith('http') ? m.photo : `http://localhost:3000${m.photo}` }} 
                                            style={styles.avatarImage} 
                                        />
                                    ) : (
                                        <Text style={styles.memberAvatarText}>{(m.prenom?.[0] || m.nom?.[0] || 'M').toUpperCase()}</Text>
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.memberName}>{m.prenom} {m.nom}</Text>
                                    <Text style={styles.memberEmail}>{m.email}</Text>
                                </View>

                                {/* Flèches de réordonnancement */}
                                {isCreator && isEnAttente && (
                                    <View style={styles.arrowsContainer}>
                                        <TouchableOpacity 
                                            style={[styles.arrowBtn, i === 0 && styles.arrowBtnDisabled]} 
                                            onPress={() => moveMember(i, 'up')}
                                            disabled={i === 0}
                                        >
                                            <ChevronUp color={i === 0 ? '#CBD5E1' : '#6366F1'} size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.arrowBtn, i === members.length - 1 && styles.arrowBtnDisabled]} 
                                            onPress={() => moveMember(i, 'down')}
                                            disabled={i === members.length - 1}
                                        >
                                            <ChevronDown color={i === members.length - 1 ? '#CBD5E1' : '#6366F1'} size={18} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {isCreator && isEnAttente && m.userId !== tontine?.creatorId && (
                                    <TouchableOpacity 
                                        style={styles.removeBtn} 
                                        onPress={() => handleRemoveMember(m.userId)}
                                    >
                                        <UserMinus color="#EF4444" size={18} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Aucun membre pour le moment</Text>
                    )}

                    {/* Bouton sauvegarder l'ordre */}
                    {isCreator && isEnAttente && orderChanged && (
                        <TouchableOpacity style={styles.saveOrderBtn} onPress={handleSaveOrder} disabled={isSavingOrder}>
                            {isSavingOrder ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Save color="#FFFFFF" size={16} />
                                    <Text style={styles.saveOrderBtnText}>Sauvegarder l'ordre</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Actions rapides</Text>
                    {isCreator && (
                        <Button 
                            title="Statistiques Cotisations" 
                            variant="outline" 
                            onPress={() => navigation.navigate('StatistiquesCotisations', { tontineId })} 
                            style={styles.actionBtn} 
                        />
                    )}
                    <Button title="Distributions" variant="outline" onPress={() => navigation.navigate('Distribution', { tontineId })} style={styles.actionBtn} />
                    <Button title="Historique paiements" variant="outline" onPress={() => navigation.navigate('PaymentHistory', { tontineId })} style={styles.actionBtn} />
                    <Button title="Chat de la tontine" variant="outline" onPress={() => navigation.navigate('Chat', { tontineId, tontineName: tontine?.nom })} style={styles.actionBtn} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    scrollContent: { padding: theme.spacing.lg, maxWidth: 600, width: '100%', alignSelf: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBg: { backgroundColor: '#1E1B4B', flexDirection: 'row', alignItems: 'center', padding: 18, gap: 10 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
    tontineName: { fontSize: 16, color: theme.colors.primary, fontWeight: '700', marginBottom: theme.spacing.lg, textAlign: 'center' },
    card: { backgroundColor: theme.colors.white, borderRadius: theme.components.borderRadius.xl, padding: theme.spacing.xl, boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3, marginBottom: theme.spacing.lg },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.components.borderRadius.round, marginTop: theme.spacing.sm },
    statusText: { fontWeight: 'bold', fontSize: 14 },
    startBtn: {
        width: '100%',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.components.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        marginTop: theme.spacing.md,
    },
    startBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
    miniBtn: { paddingVertical: 6, paddingHorizontal: theme.spacing.md, width: 'auto' },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.surface, gap: 8 },
    orderBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    orderBadgeText: { fontSize: 11, fontWeight: '800', color: '#6366F1' },
    memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    memberAvatarText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
    memberName: { fontWeight: '600', fontSize: 14, color: theme.colors.text },
    memberEmail: { fontSize: 12, color: theme.colors.textSecondary },
    emptyText: { color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: theme.spacing.sm },
    actionBtn: { marginBottom: theme.spacing.sm },
    prerequisiteText: { color: '#B45309', fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18 },
    removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
    arrowsContainer: { flexDirection: 'column', gap: 2 },
    arrowBtn: { width: 28, height: 22, borderRadius: 6, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    arrowBtnDisabled: { backgroundColor: '#F8FAFC' },
    orderHint: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: '#C7D2FE' },
    orderHintText: { color: '#6366F1', fontSize: 12, fontWeight: '600', textAlign: 'center' },
    saveOrderBtn: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#6366F1', paddingVertical: 12, borderRadius: 12, marginTop: 12 
    },
    saveOrderBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
