import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useTontineStore } from '../../store/useTontineStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FileCheck, FileText, Users, Calendar, Wallet, ShieldCheck } from 'lucide-react-native';

export const ConfirmTontineScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { tontineData } = route.params;
    const { createTontine, isLoading, error } = useTontineStore();

    const freqLabels: Record<string, string> = {
        QUOTIDIENNE: 'Quotidienne',
        HEBDOMADAIRE: 'Hebdomadaire',
        MENSUELLE: 'Mensuelle',
        TRIMESTRIELLE: 'Trimestrielle',
    };

    const handlePublish = async () => {
        const { nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu } = tontineData;
        const payload = { nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu };

        console.log('[ConfirmTontine] Publishing with payload:', JSON.stringify(payload));

        const result = await createTontine(payload);
        if (result) {
            Alert.alert('Tontine créée 🎉', 'Votre tontine a été publiée avec succès !', [
                { text: 'Inviter des membres', onPress: () => navigation.replace('InviteMembers', { tontineId: result.id, tontineName: result.nom }) },
                { text: 'Retour à la liste', onPress: () => navigation.navigate('TontinesList') },
            ]);
        } else {
            const storeError = useTontineStore.getState().error;
            Alert.alert('Erreur ❌', storeError || 'Impossible de créer la tontine. Vérifiez votre connexion.');
        }
    };

    const infoRows = [
        { icon: <FileText color="#6366F1" size={20} />, label: 'Nom', value: tontineData.nom },
        { icon: <Wallet color="#059669" size={20} />, label: 'Cotisation', value: `${Number(tontineData.montantCotisation).toLocaleString('fr-FR')} FCFA` },
        { icon: <Calendar color="#D97706" size={20} />, label: 'Fréquence', value: freqLabels[tontineData.frequence] || tontineData.frequence },
        { icon: <Calendar color="#6B7280" size={20} />, label: 'Durée', value: `${tontineData.dureeTotale} cycles` },
        { icon: <Users color="#6366F1" size={20} />, label: 'Membres', value: `${tontineData.nbMembresAttendu} personnes` },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <FileCheck color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.title}>Vérifier et Publier</Text>
                    <Text style={styles.subtitle}>Relisez les informations avant de publier</Text>

                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={styles.stepDotDone} />
                        <View style={styles.stepLineDone} />
                        <View style={styles.stepDotActive} />
                    </View>
                    <Text style={styles.stepText}>Étape 2 / 2 — Confirmation</Text>
                </View>

                {/* Info Card */}
                <View style={styles.card}>
                    {infoRows.map((row, i) => (
                        <View key={i} style={[styles.infoRow, i === infoRows.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.infoLeft}>
                                <View style={styles.infoIconBg}>
                                    {row.icon}
                                </View>
                                <Text style={styles.infoLabel}>{row.label}</Text>
                            </View>
                            <Text style={styles.infoValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Trust badge */}
                <View style={styles.trustBadge}>
                    <ShieldCheck color="#6366F1" size={18} />
                    <Text style={styles.trustText}>Tontine sécurisée et gérée par TontineFit</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button title="Publier la tontine ✓" onPress={handlePublish} isLoading={isLoading} style={styles.publishBtn} />
                    <Button title="← Modifier" variant="outline" onPress={() => navigation.goBack()} style={styles.modifyBtn} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    scrollContent: { padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center' },
    header: { alignItems: 'center', marginBottom: 24 },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#6366F1',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        boxShadow: '0px 4px 16px rgba(99,102,241,0.35)',
        elevation: 4,
    },
    title: { fontSize: 24, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, marginBottom: 14 },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    stepDotDone: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34D399' },
    stepLineDone: { width: 40, height: 2, backgroundColor: '#34D399', marginHorizontal: 8 },
    stepDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6366F1' },
    stepText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 4,
        boxShadow: '0px 4px 24px rgba(0,0,0,0.08)',
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoIconBg: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center',
    },
    infoLabel: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
    infoValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    trustBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
    },
    trustText: { fontSize: 12, color: '#4338CA', fontWeight: '600' },
    actions: { marginTop: 20, gap: 10 },
    publishBtn: { backgroundColor: '#6366F1', borderRadius: 14 },
    modifyBtn: { borderRadius: 14, borderColor: '#CBD5E1' },
});
