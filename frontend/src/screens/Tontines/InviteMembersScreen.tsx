import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserPlus, Mail, Link2, CheckCircle, Copy, Check } from 'lucide-react-native';

export const InviteMembersScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId, tontineName } = route.params;

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [invitedList, setInvitedList] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const joinLink = `${window.location.origin}/join/${tontineId}`;

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
            setInvitedList(prev => [...prev, email.trim()]);
            setEmail('');
            alert(`✉️ Invitation envoyée à ${email.trim()} !`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(joinLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = joinLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <UserPlus color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.title}>Inviter des membres</Text>
                    <Text style={styles.subtitle}>{tontineName}</Text>
                </View>

                {/* Email invite */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📧 Inviter par email</Text>

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
                        icon={Mail}
                    />
                    <Button title="Envoyer l'invitation" onPress={handleInvite} isLoading={isLoading} style={{ backgroundColor: '#6366F1' }} />
                </View>

                {/* Share link */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔗 Partager le lien</Text>
                    <Text style={styles.shareDesc}>Copiez ce lien et partagez-le via WhatsApp, SMS ou tout autre moyen.</Text>

                    <View style={styles.linkBox}>
                        <Link2 color="#6366F1" size={16} />
                        <Text style={styles.linkText} numberOfLines={1}>{joinLink}</Text>
                    </View>

                    <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={handleCopy} activeOpacity={0.7}>
                        {copied ? (
                            <>
                                <Check color="#059669" size={16} />
                                <Text style={styles.copyBtnTextDone}>Copié !</Text>
                            </>
                        ) : (
                            <>
                                <Copy color="#6366F1" size={16} />
                                <Text style={styles.copyBtnText}>Copier le lien</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Invited list */}
                {invitedList.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>✅ Invitations envoyées ({invitedList.length})</Text>
                        {invitedList.map((em, i) => (
                            <View key={i} style={styles.invitedRow}>
                                <CheckCircle color="#059669" size={18} />
                                <Text style={styles.invitedEmail}>{em}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Button title="← Terminé" variant="outline" onPress={() => navigation.navigate('TontinesList')} style={{ marginTop: 12, borderColor: '#CBD5E1' }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    scrollContent: { padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center' },
    header: { alignItems: 'center', marginBottom: 24 },
    iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '900', color: '#1E1B4B' },
    subtitle: { fontSize: 14, color: '#6366F1', fontWeight: '600', marginTop: 4 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3, marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12 },
    shareDesc: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 18 },
    linkBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    linkText: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#6366F1',
        backgroundColor: '#EEF2FF',
    },
    copyBtnDone: {
        borderColor: '#059669',
        backgroundColor: '#D1FAE5',
    },
    copyBtnText: {
        color: '#6366F1',
        fontWeight: '700',
        fontSize: 14,
    },
    copyBtnTextDone: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 14,
    },
    errorBanner: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    errorText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
    invitedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    invitedEmail: { fontSize: 14, color: '#374151' },
});
