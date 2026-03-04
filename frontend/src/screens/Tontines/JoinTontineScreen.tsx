import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Users, Wallet, Calendar, ShieldCheck, ArrowRight } from 'lucide-react-native';

interface TontinePresentation {
    id: string;
    nom: string;
    montantCotisation: number;
    frequence: string;
    dureeTotale: number;
    nbMembresAttendu: number;
    statut: string;
    creatorName?: string;
}

export const JoinTontineScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId } = route.params;

    const [tontine, setTontine] = useState<TontinePresentation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const freqLabels: Record<string, string> = {
        QUOTIDIENNE: 'Quotidienne',
        HEBDOMADAIRE: 'Hebdomadaire',
        MENSUELLE: 'Mensuelle',
        TRIMESTRIELLE: 'Trimestrielle',
    };

    useEffect(() => {
        loadTontine();
    }, []);

    const loadTontine = async () => {
        try {
            const res = await apiClient.get(`/tontines/${tontineId}`);
            setTontine(res.data.tontine || res.data);
        } catch (err: any) {
            setError('Impossible de charger les informations de cette tontine.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        setJoining(true);
        try {
            await apiClient.post(`/tontines/${tontineId}/join`);
            Alert.alert('Bienvenue ! 🎉', 'Vous avez rejoint la tontine avec succès.', [
                { text: 'Voir la tontine', onPress: () => navigation.replace('TontineDetails', { id: tontineId }) }
            ]);
        } catch (err: any) {
            Alert.alert('Erreur', err.response?.data?.message || 'Impossible de rejoindre la tontine.');
        } finally {
            setJoining(false);
        }
    };

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
    }

    if (error || !tontine) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error || 'Tontine introuvable'}</Text>
                <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.lg }} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.presentationCard}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tontine.statut}</Text>
                    </View>
                    <Text style={styles.tontineName}>{tontine.nom}</Text>

                    <View style={styles.statsGrid}>
                        <StatItem icon={<Wallet color={theme.colors.primary} size={22} />} label="Cotisation" value={`${Number(tontine.montantCotisation).toLocaleString('fr-FR')} FCFA`} />
                        <StatItem icon={<Calendar color={theme.colors.warning} size={22} />} label="Fréquence" value={freqLabels[tontine.frequence] || tontine.frequence} />
                        <StatItem icon={<Calendar color={theme.colors.textSecondary} size={22} />} label="Durée" value={`${tontine.dureeTotale} tours`} />
                        <StatItem icon={<Users color={theme.colors.success} size={22} />} label="Places" value={`${tontine.nbMembresAttendu} membres`} />
                    </View>

                    <View style={styles.garantie}>
                        <ShieldCheck color={theme.colors.primary} size={20} />
                        <Text style={styles.garantieText}>Tontine sécurisée et gérée par TontineFit</Text>
                    </View>
                </View>

                <Button title="Rejoindre cette tontine" onPress={handleJoin} isLoading={joining} style={styles.joinBtn} />
                <Button title="Retour" variant="outline" onPress={() => navigation.goBack()} />
            </ScrollView>
        </SafeAreaView>
    );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View style={styles.stat}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EEF2FF' },
    scrollContent: { padding: theme.spacing.lg, maxWidth: 520, width: '100%', alignSelf: 'center', justifyContent: 'center', flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    errorText: { color: theme.colors.error, fontSize: 16, textAlign: 'center' },
    presentationCard: { backgroundColor: theme.colors.white, borderRadius: theme.components.borderRadius.xl, padding: theme.spacing.xl, boxShadow: '0px 4px 24px rgba(0,86,210,0.10)', elevation: 5, alignItems: 'center', marginBottom: theme.spacing.xl },
    badge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: theme.spacing.md, paddingVertical: 4, borderRadius: theme.components.borderRadius.round, marginBottom: theme.spacing.md },
    badgeText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 12 },
    tontineName: { fontSize: 26, fontWeight: '900', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xl },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, width: '100%' },
    stat: { flex: 1, minWidth: '40%', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.components.borderRadius.md, padding: theme.spacing.md },
    statValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginTop: 4, textAlign: 'center' },
    statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
    garantie: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xl, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.surface },
    garantieText: { fontSize: 13, color: theme.colors.textSecondary },
    joinBtn: { marginBottom: theme.spacing.md },
});
