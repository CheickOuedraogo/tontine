import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useTontineStore } from '../../store/useTontineStore';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { FileCheck, Users, Calendar, Wallet, ShieldCheck, ChevronLeft } from 'lucide-react-native';

export const ConfirmTontineScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { tontineData } = route.params;
    const { createTontine, isLoading, fetchMyTontines } = useTontineStore();

    const handlePublish = async () => {
        const result = await createTontine(tontineData);
        if (result) {
            await fetchMyTontines();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs', params: { screen: 'Dashboard' } }],
                })
            );
        } else {
            const storeError = useTontineStore.getState().error;
            Alert.alert('Erreur', storeError || 'Impossible de creer la tontine.');
        }
    };

    const infoRows = [
        { icon: <Wallet color="#6366F1" size={20} />, label: 'Nom', value: tontineData.nom },
        { icon: <Wallet color="#059669" size={20} />, label: 'Cotisation', value: `${Number(tontineData.montantCotisation).toLocaleString('fr-FR')} FCFA` },
        { icon: <Calendar color="#D97706" size={20} />, label: 'Intervalle', value: `Tous les ${tontineData.intervalleJours} jours` },
        { icon: <Users color="#6366F1" size={20} />, label: 'Membres', value: `${tontineData.nbMembresAttendu} personnes` },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <ChevronLeft color="#1E1B4B" size={24} />
                    </TouchableOpacity>
                    <View style={styles.iconCircle}>
                        <FileCheck color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.title}>Verifier et Publier</Text>
                    <Text style={styles.subtitle}>Relisez les informations avant de publier</Text>

                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={styles.stepDotDone} />
                        <View style={styles.stepLineDone} />
                        <View style={styles.stepDotActive} />
                    </View>
                    <Text style={styles.stepText}>Etape 2 / 2 - Confirmation</Text>
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
                    <Text style={styles.trustText}>Tontine securisee et geree par TontineFit</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button title="Publier la tontine" onPress={handlePublish} isLoading={isLoading} style={styles.publishBtn} />
                    <Button title="Modifier" variant="outline" onPress={() => navigation.goBack()} style={styles.modifyBtn} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    scrollContent: { padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center' },
    header: { alignItems: 'center', marginBottom: 24, position: 'relative' },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        elevation: 2,
    },
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
