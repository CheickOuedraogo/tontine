import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserPlus, Mail, CheckCircle, Clock, XCircle, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export const InviteMembersScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId, tontineName } = route.params;
    const currentUser = useAuthStore(state => state.user);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [tontine, setTontine] = useState<any>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const res = await apiClient.get(`/tontines/${tontineId}`);
            const tontineData = res.data.tontine || res.data;
            setTontine(tontineData);
            
            if (tontineData.creatorId === currentUser?.id) {
                loadInvitations();
            }
        } catch (err) {
            // Access check failed
        } finally {
            setCheckingAccess(false);
        }
    };

    const loadInvitations = async () => {
        try {
            const res = await apiClient.get(`/invitations/tontine/${tontineId}`);
            setInvitations(res.data.invitations || []);
        } catch { }
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            setError('Veuillez entrer un email.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await apiClient.post(`/invitations/tontine/${tontineId}`, {
                emailInvite: email.trim(),
            });
            Alert.alert('Succes', `Invitation envoyee a ${email.trim()} ! L'utilisateur recevra une notification.`);
            setEmail('');
            loadInvitations();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig: Record<string, { color: string; bg: string; label: string; Icon: any }> = {
        EN_ATTENTE: { color: '#D97706', bg: '#FEF3C7', label: 'En attente', Icon: Clock },
        ACCEPTEE: { color: '#059669', bg: '#D1FAE5', label: 'Acceptee', Icon: CheckCircle },
        REFUSEE: { color: '#EF4444', bg: '#FEE2E2', label: 'Refusee', Icon: XCircle },
        EXPIREE: { color: '#6B7280', bg: '#F3F4F6', label: 'Expiree', Icon: Clock },
    };

    // Vérifier si l'utilisateur est le créateur (conversion en string pour éviter les problèmes de type)
    const isCreator = String(tontine?.creatorId) === String(currentUser?.id);

    if (checkingAccess) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!isCreator) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerBg}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <UserPlus color="#FFFFFF" size={22} />
                    <View>
                        <Text style={styles.headerTitle}>Inviter des membres</Text>
                        <Text style={styles.headerSub}>{tontineName}</Text>
                    </View>
                </View>
                <View style={styles.center}>
                    <AlertCircle color="#EF4444" size={48} />
                    <Text style={styles.accessDeniedTitle}>Accès refusé</Text>
                    <Text style={styles.accessDeniedText}>
                        Seul le créateur de la tontine peut inviter des membres.
                    </Text>
                    <Button 
                        title="Retour" 
                        onPress={() => navigation.goBack()} 
                        style={{ marginTop: 20 }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerBg}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <UserPlus color="#FFFFFF" size={22} />
                <View>
                    <Text style={styles.headerTitle}>Inviter des membres</Text>
                    <Text style={styles.headerSub}>{tontineName}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Email invite */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Inviter par email</Text>
                    <Text style={styles.cardDesc}>L'utilisateur recevra une notification dans l'application et pourra accepter ou refuser.</Text>

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Input
                        label="Adresse email du membre"
                        placeholder="membre@email.com"
                        value={email}
                        onChangeText={(t: string) => { setEmail(t); setError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Button title="Envoyer l'invitation" onPress={handleInvite} isLoading={isLoading} style={{ backgroundColor: '#6366F1' }} />
                </View>

                {/* Invitations list */}
                {invitations.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Invitations ({invitations.length})</Text>
                        {invitations.map((inv: any, i: number) => {
                            const cfg = statusConfig[inv.statut] || statusConfig.EN_ATTENTE;
                            const StatusIcon = cfg.Icon;
                            return (
                                <View key={i} style={styles.invitedRow}>
                                    <View style={[styles.statusIcon, { backgroundColor: cfg.bg }]}>
                                        <StatusIcon color={cfg.color} size={16} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.invitedEmail}>{inv.emailInvite}</Text>
                                        {inv.nom && <Text style={styles.invitedName}>{inv.prenom} {inv.nom}</Text>}
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                                        <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    scrollContent: { padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center' },
    headerBg: { backgroundColor: '#1E1B4B', flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { fontSize: 12, color: '#A5B4FC', marginTop: 2 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3, marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 18 },
    errorBanner: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    errorText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
    invitedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statusIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    invitedEmail: { fontSize: 14, color: '#374151', fontWeight: '600' },
    invitedName: { fontSize: 12, color: '#64748B' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700' },
    accessDeniedTitle: { fontSize: 20, fontWeight: '700', color: '#1E1B4B', marginTop: 16, textAlign: 'center' },
    accessDeniedText: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
