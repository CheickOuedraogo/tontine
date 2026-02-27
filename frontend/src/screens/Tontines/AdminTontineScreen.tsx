import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Settings, Users, Play, Pause, Trash2, UserPlus, BarChart3 } from 'lucide-react-native';

export const AdminTontineScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId, tontineName } = route.params;

    const [tontine, setTontine] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            setMembers(mRes.data.membres || mRes.data.data || []);
        } catch {
            // Silently handle
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async () => {
        const confirmed = confirm('Êtes-vous sûr de vouloir démarrer les cycles de la tontine ?');
        if (!confirmed) return;

        try {
            await apiClient.post(`/tontines/${tontineId}/start`);
            alert('✅ La tontine est maintenant active !');
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Impossible de démarrer.';
            alert('❌ ' + msg);
        }
    };

    if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

    const membersCount = Array.isArray(members) ? members.length : 0;
    const membersReady = membersCount >= (tontine?.nbMembresAttendu || 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBar}>
                    <Settings color={theme.colors.primary} size={28} />
                    <Text style={styles.title}>Administration</Text>
                    <Text style={styles.subtitle}>{tontineName || tontine?.nom}</Text>
                </View>

                {/* Status Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Statut</Text>
                    <View style={[styles.statusBadge, { backgroundColor: tontine?.statut === 'ACTIVE' ? theme.colors.successLight : theme.colors.primaryLight }]}>
                        <Text style={[styles.statusText, { color: tontine?.statut === 'ACTIVE' ? theme.colors.success : theme.colors.primaryDark }]}>
                            {tontine?.statut || 'EN_ATTENTE'}
                        </Text>
                    </View>

                    {tontine?.statut === 'EN_ATTENTE' && (
                        <>
                            <Button title="Démarrer la Tontine" onPress={handleStart} style={{ marginTop: theme.spacing.md }} />
                            {!membersReady && (
                                <Text style={styles.prerequisiteText}>
                                    ⚠️ Il faut {tontine?.nbMembresAttendu} membres (actuellement {membersCount}) et que tous signent le contrat.
                                </Text>
                            )}
                        </>
                    )}
                </View>

                {/* Members */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Membres ({Array.isArray(members) ? members.length : 0} / {tontine?.nbMembresAttendu || '?'})</Text>
                        <Button
                            title="Inviter"
                            variant="secondary"
                            onPress={() => navigation.navigate('InviteMembers', { tontineId, tontineName: tontine?.nom })}
                            style={styles.miniBtn}
                        />
                    </View>
                    {Array.isArray(members) && members.length > 0 ? (
                        members.map((m: any, i: number) => (
                            <View key={i} style={styles.memberRow}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>{(m.prenom?.[0] || m.nom?.[0] || 'M').toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.memberName}>{m.prenom} {m.nom}</Text>
                                    <Text style={styles.memberEmail}>{m.email}</Text>
                                </View>
                                <Text style={styles.memberRole}>{m.role || 'Membre'}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Aucun membre pour le moment</Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Actions rapides</Text>
                    <Button title="Voir les cotisations" variant="outline" onPress={() => navigation.navigate('Cotisations', { tontineId })} style={styles.actionBtn} />
                    <Button title="Distributions" variant="outline" onPress={() => navigation.navigate('Distribution', { tontineId })} style={styles.actionBtn} />
                    <Button title="Historique paiements" variant="outline" onPress={() => navigation.navigate('PaymentHistory', { tontineId })} style={styles.actionBtn} />
                    <Button title="Chat de la tontine" variant="outline" onPress={() => navigation.navigate('Chat', { tontineId, tontineName: tontine?.nom })} style={styles.actionBtn} />
                    <Button title="Contrat" variant="outline" onPress={() => navigation.navigate('Contrat', { tontineId })} style={styles.actionBtn} />
                </View>

                <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.md }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEF2FF' },
    scrollContent: { padding: theme.spacing.lg, maxWidth: 600, width: '100%', alignSelf: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBar: { alignItems: 'center', marginBottom: theme.spacing.xl },
    title: { fontSize: 24, fontWeight: '900', color: theme.colors.text, marginTop: theme.spacing.sm },
    subtitle: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
    card: { backgroundColor: theme.colors.white, borderRadius: theme.components.borderRadius.xl, padding: theme.spacing.xl, boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3, marginBottom: theme.spacing.lg },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.components.borderRadius.round, marginTop: theme.spacing.sm },
    statusText: { fontWeight: 'bold', fontSize: 14 },
    miniBtn: { paddingVertical: 6, paddingHorizontal: theme.spacing.md, width: 'auto' },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.surface, gap: theme.spacing.sm },
    memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    memberAvatarText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
    memberName: { fontWeight: '600', fontSize: 14, color: theme.colors.text },
    memberEmail: { fontSize: 12, color: theme.colors.textSecondary },
    memberRole: { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },
    emptyText: { color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: theme.spacing.sm },
    actionBtn: { marginBottom: theme.spacing.sm },
    prerequisiteText: { color: '#B45309', fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18 },
});
