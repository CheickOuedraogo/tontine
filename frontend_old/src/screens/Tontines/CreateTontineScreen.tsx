import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTontineStore } from '../../store/useTontineStore';
import { FilePlus, ChevronLeft } from 'lucide-react-native';

export const CreateTontineScreen = ({ navigation }: any) => {
    const isLoading = useTontineStore((state) => state.isLoading);

    const [nom, setNom] = useState('');
    const [montantCotisation, setMontantCotisation] = useState('');
    const [intervalleJours, setIntervalleJours] = useState('30');
    const [nbMembresAttendu, setNbMembresAttendu] = useState('');

    const handleCreate = () => {
        if (!nom || !montantCotisation || !intervalleJours || !nbMembresAttendu) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs pour continuer.');
            return;
        }

        const payload = {
            nom,
            montantCotisation: Number(montantCotisation),
            intervalleJours: Number(intervalleJours),
            nbMembresAttendu: Number(nbMembresAttendu),
        };

        navigation.navigate('ConfirmTontine', { tontineData: payload });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                        <FilePlus color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.title}>Nouvelle Tontine</Text>
                    <Text style={styles.subtitle}>Configurez les parametres de votre tontine</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, styles.stepDotActive]} />
                        <View style={styles.stepLine} />
                        <View style={styles.stepDot} />
                    </View>
                    <Text style={styles.stepText}>Etape 1 / 2 - Informations</Text>

                    <View style={styles.formSection}>
                        <Input
                            label="Nom de la Tontine"
                            placeholder="Ex: Tontine Famille"
                            value={nom}
                            onChangeText={setNom}
                        />

                        <Input
                            label="Montant de la Cotisation (FCFA)"
                            placeholder="Ex: 50000"
                            value={montantCotisation}
                            onChangeText={setMontantCotisation}
                            keyboardType="numeric"
                        />

                        <Input
                            label="Intervalle entre cotisations (jours)"
                            placeholder="Ex: 30"
                            value={intervalleJours}
                            onChangeText={setIntervalleJours}
                            keyboardType="numeric"
                        />

                        <Input
                            label="Nombre de membres attendus"
                            placeholder="Ex: 10"
                            value={nbMembresAttendu}
                            onChangeText={setNbMembresAttendu}
                            keyboardType="numeric"
                        />
                    </View>

                    <Button
                        title="Continuer"
                        onPress={handleCreate}
                        isLoading={isLoading}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
    },
    scrollContent: {
        padding: 20,
        maxWidth: 520,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 8,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 8,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        boxShadow: '0px 4px 16px rgba(99,102,241,0.35)',
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E1B4B',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: 24,
        borderRadius: 20,
        boxShadow: '0px 4px 24px rgba(0,0,0,0.08)',
        elevation: 5,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E2E8F0',
    },
    stepDotActive: {
        backgroundColor: '#6366F1',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
    },
    stepText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: 20,
    },
    formSection: {
        gap: 0,
    },
    actionBtn: {
        marginTop: 20,
        backgroundColor: '#6366F1',
        borderRadius: 14,
    },
});
