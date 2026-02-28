import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTontineStore } from '../../store/useTontineStore';
import { FilePlus, Wallet, Clock, Users, Hash, ChevronLeft } from 'lucide-react-native';

export const CreateTontineScreen = ({ navigation }: any) => {
    const createTontine = useTontineStore((state) => state.createTontine);
    const isLoading = useTontineStore((state) => state.isLoading);

    const [nom, setNom] = useState('');
    const [montantCotisation, setMontantCotisation] = useState('');
    const [frequence, setFrequence] = useState<'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE'>('MENSUELLE');
    const [dureeTotale, setDureeTotale] = useState('');
    const [nbMembresAttendu, setNbMembresAttendu] = useState('');
    const [type, setType] = useState<'CLASSIQUE' | 'ACHAT_COMMUN'>('CLASSIQUE');
    const [pourcentageFrais, setPourcentageFrais] = useState('0');

    const frequences = [
        { key: 'HEBDOMADAIRE', label: 'Hebdo', icon: '📅' },
        { key: 'MENSUELLE', label: 'Mensuel', icon: '🗓️' },
        { key: 'TRIMESTRIELLE', label: 'Trimestriel', icon: '📆' },
    ];

    const types = [
        { key: 'CLASSIQUE', label: 'Classique (Rotative)', sub: 'Chacun reçoit à son tour', icon: '♻️' },
        { key: 'ACHAT_COMMUN', label: 'Achat Commun', sub: 'Épargne groupée / Projet', icon: '🛍️' },
    ];

    // Auto-fill membres pour tontine classique
    React.useEffect(() => {
        if (type === 'CLASSIQUE' && dureeTotale) {
            setNbMembresAttendu(dureeTotale);
        }
    }, [dureeTotale, type]);

    const handleCreate = () => {
        if (!nom || !montantCotisation || !dureeTotale || !nbMembresAttendu) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs pour continuer.');
            return;
        }

        const payload = {
            nom,
            montantCotisation: Number(montantCotisation),
            frequence,
            dureeTotale: Number(dureeTotale),
            nbMembresAttendu: Number(nbMembresAttendu),
            pourcentageFrais: Number(pourcentageFrais),
            type,
        };

        navigation.navigate('ConfirmTontine', { tontineData: payload });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <FilePlus color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.title}>Nouvelle Tontine</Text>
                    <Text style={styles.subtitle}>Configurez les paramètres de votre tontine</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, styles.stepDotActive]} />
                        <View style={styles.stepLine} />
                        <View style={styles.stepDot} />
                    </View>
                    <Text style={styles.stepText}>Étape 1 / 2 — Informations</Text>

                    <View style={styles.formSection}>
                        <Input
                            label="Nom de la Tontine"
                            placeholder="Ex: Tontine Famille"
                            value={nom}
                            onChangeText={setNom}
                        />

                        {/* Type Selector */}
                        <View style={styles.freqSection}>
                            <Text style={styles.freqLabel}>Type de Tontine</Text>
                            <View style={{ gap: 8 }}>
                                {types.map(t => (
                                    <TouchableOpacity
                                        key={t.key}
                                        style={[
                                            styles.typeCard,
                                            type === t.key && styles.freqCardActive,
                                        ]}
                                        onPress={() => setType(t.key as any)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.typeIcon}>{/* @ts-ignore */}<Text style={{fontSize: 20}}>{t.icon}</Text></View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.typeTitle, type === t.key && { color: '#6366F1' }]}>{t.label}</Text>
                                            <Text style={styles.typeSub}>{t.sub}</Text>
                                        </View>
                                        {type === t.key && <View style={styles.checkCircle} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <Input
                            label="Montant de la Cotisation (FCFA)"
                            placeholder="Ex: 50 000"
                            value={montantCotisation}
                            onChangeText={setMontantCotisation}
                            keyboardType="numeric"
                        />

                        {/* Frequency Selector */}
                        <View style={styles.freqSection}>
                            <Text style={styles.freqLabel}>Fréquence de cotisation</Text>
                            <View style={styles.freqRow}>
                                {frequences.map(f => (
                                    <TouchableOpacity
                                        key={f.key}
                                        style={[
                                            styles.freqCard,
                                            frequence === f.key && styles.freqCardActive,
                                        ]}
                                        onPress={() => setFrequence(f.key as any)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.freqEmoji}>{f.icon}</Text>
                                        <Text style={[
                                            styles.freqText,
                                            frequence === f.key && styles.freqTextActive,
                                        ]}>{f.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Durée (Cycles)"
                                    placeholder="Ex: 12"
                                    value={dureeTotale}
                                    onChangeText={setDureeTotale}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Membres"
                                    placeholder="Ex: 10"
                                    value={nbMembresAttendu}
                                    onChangeText={setNbMembresAttendu}
                                    keyboardType="numeric"
                                    editable={type !== 'CLASSIQUE'}
                                />
                            </View>
                        </View>

                        <Input
                            label="Frais de gestion Créateur (%)"
                            placeholder="Ex: 5"
                            value={pourcentageFrais}
                            onChangeText={setPourcentageFrais}
                            keyboardType="numeric"
                        />
                    </View>


                    <Button
                        title="Continuer →"
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
    freqSection: {
        marginBottom: 16,
    },
    freqLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    freqRow: {
        flexDirection: 'row',
        gap: 10,
    },
    freqCard: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    freqCardActive: {
        borderColor: '#6366F1',
        backgroundColor: '#EEF2FF',
    },
    freqEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    freqText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.textSecondary,
    },
    freqTextActive: {
        color: '#6366F1',
    },
    actionBtn: {
        marginTop: 20,
        backgroundColor: '#6366F1',
        borderRadius: 14,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    typeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        elevation: 1,
    },
    typeTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E1B4B',
    },
    typeSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#6366F1',
        borderWidth: 3,
        borderColor: '#EEF2FF',
    },
});

