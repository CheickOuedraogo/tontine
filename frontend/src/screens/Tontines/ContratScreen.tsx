import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../theme';
import { useContratStore } from '../../store/useContratStore';
import { useAuthStore } from '../../store/useAuthStore';
import { contratApi } from '../../api/contrat';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { FileText, CheckCircle, AlertCircle, ShieldCheck, FilePlus } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const generateContratText = (tontine: any) => {
    return `CONTRAT D'ENGAGEMENT — TONTINE "${(tontine?.nom || 'N/A').toUpperCase()}"

Article 1 — Objet
Le présent contrat régit les conditions de participation à la tontine "${tontine?.nom || 'N/A'}" organisée via la plateforme TontineFit.

Article 2 — Cotisation
Chaque membre s'engage à verser la somme de ${Number(tontine?.montantCotisation || 0).toLocaleString('fr-FR')} FCFA selon la fréquence ${(tontine?.frequence || 'MENSUELLE').toLowerCase()} convenue.

Article 3 — Durée
La tontine se déroule sur ${tontine?.dureeTotale || 'N/A'} cycles. Chaque membre s'engage à participer pour la durée totale.

Article 4 — Membres
Le nombre de membres attendus est de ${tontine?.nbMembresAttendu || 'N/A'} personnes. La tontine ne pourra démarrer qu'une fois ce nombre atteint et que tous les membres auront signé le présent contrat.

Article 5 — Ordre de distribution
L'ordre de distribution des fonds sera déterminé de manière aléatoire au démarrage de la tontine.

Article 6 — Retard de paiement
Tout retard de paiement entraînera une notification automatique. En cas de non-paiement répété, le membre pourra être exclu de la tontine.

Article 7 — Engagement
En signant électroniquement ce contrat, chaque membre s'engage à respecter l'ensemble des conditions ci-dessus et à honorer ses cotisations dans les délais impartis.

Fait sur TontineFit, le ${new Date().toLocaleDateString('fr-FR')}.`;
};

export const ContratScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId } = route.params;

    const { currentContrat, signatures, isLoading, error, fetchContrat, fetchSignatures, signerContrat } = useContratStore();
    const user = useAuthStore(state => state.user);

    const [signing, setSigning] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, [tontineId]);

    const loadData = async () => {
        await fetchContrat(tontineId);
    };

    useEffect(() => {
        if (currentContrat) {
            fetchSignatures(currentContrat.id);
        }
    }, [currentContrat]);

    const handleGenerateContrat = async () => {
        setGenerating(true);
        try {
            // Fetch tontine details to generate text
            const tontineRes = await apiClient.get(`/tontines/${tontineId}`);
            const tontine = tontineRes.data.tontine || tontineRes.data;
            const texte = generateContratText(tontine);
            await contratApi.createContrat(tontineId, texte);
            Alert.alert('Contrat généré ✅', 'Le contrat a été créé avec succès. Les membres peuvent maintenant le signer.');
            await loadData();
        } catch (err: any) {
            Alert.alert('Erreur', err.response?.data?.message || 'Impossible de générer le contrat.');
        } finally {
            setGenerating(false);
        }
    };

    const hasSigned = signatures.some(sig => sig.userId === user?.id);

    const handleSign = async () => {
        const confirmed = confirm("En signant électroniquement ce document, vous vous engagez à respecter les conditions de la tontine.\n\nCliquez OK pour signer.");
        if (!confirmed || !currentContrat) return;

        setSigning(true);
        try {
            const success = await signerContrat(currentContrat.id);
            if (success) {
                Alert.alert("Signature enregistrée ✅", "Votre signature a bien été prise en compte.");
            } else {
                const storeError = useContratStore.getState().error;
                Alert.alert("Erreur", storeError || "Impossible de signer le contrat.");
            }
        } catch (err: any) {
            console.error('[ContratScreen] Sign error:', err);
            Alert.alert("Erreur", "Une erreur est survenue lors de la signature.");
        } finally {
            setSigning(false);
        }
    };

    if (isLoading && !currentContrat) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    // No contract exists — show generation UI
    if (!currentContrat) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <View style={styles.emptyIcon}>
                        <FilePlus color="#6366F1" size={40} />
                    </View>
                    <Text style={styles.emptyTitle}>Aucun contrat</Text>
                    <Text style={styles.emptyText}>
                        Aucun contrat n'a encore été généré{'\n'}pour cette tontine.
                    </Text>
                    <Button
                        title="Générer le contrat"
                        onPress={handleGenerateContrat}
                        isLoading={generating}
                        style={styles.generateBtn}
                    />
                    <Button
                        title="Retour"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={{ marginTop: 10, borderColor: '#CBD5E1' }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <FileText color="#FFFFFF" size={24} />
                </View>
                <Text style={styles.headerTitle}>Contrat d'Engagement</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Document */}
                <View style={styles.documentCard}>
                    <Text style={styles.documentText}>
                        {currentContrat.texteContrat || "Le texte du contrat devrait apparaître ici."}
                    </Text>
                    <Text style={styles.dateInfo}>
                        Généré le: {new Date(currentContrat.dateCreation).toLocaleDateString('fr-FR')}
                    </Text>
                </View>

                {/* Signatures */}
                <View style={styles.signaturesCard}>
                    <Text style={styles.sectionTitle}>Signatures ({signatures.length})</Text>
                    {signatures.map((sig: any, index: number) => (
                        <View key={index} style={styles.signatureRow}>
                            <CheckCircle color="#059669" size={18} />
                            <Text style={styles.signatureName}>
                                {sig.prenom ? `${sig.prenom} ${sig.nom}` : `Membre ${sig.userId.substring(0, 8)}...`}
                            </Text>
                            <Text style={styles.signatureDate}>
                                {new Date(sig.dateSignature).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                    ))}
                    {signatures.length === 0 && (
                        <Text style={styles.noSignatureText}>Aucun membre n'a encore signé.</Text>
                    )}
                </View>

                {/* Sign or Signed badge */}
                {!hasSigned ? (
                    <Button
                        title="✍️ Signer électroniquement"
                        onPress={handleSign}
                        isLoading={signing}
                        style={styles.signBtn}
                    />
                ) : (
                    <View style={styles.signedBadge}>
                        <ShieldCheck color="#059669" size={22} />
                        <Text style={styles.signedText}>Vous avez signé ce contrat</Text>
                    </View>
                )}

                <Button
                    title="← Retour"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 12, borderColor: '#CBD5E1' }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E1B4B',
        marginBottom: 6,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    generateBtn: {
        backgroundColor: '#6366F1',
        borderRadius: 14,
        paddingHorizontal: 32,
    },
    // Header
    header: {
        backgroundColor: '#1E1B4B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        gap: 10,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    scrollContent: {
        padding: 16,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    // Document
    documentCard: {
        backgroundColor: '#FFFCF0',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8DEB5',
        marginBottom: 16,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
        elevation: 3,
    },
    documentText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
    },
    dateInfo: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 16,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    // Signatures
    signaturesCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E1B4B',
        marginBottom: 12,
    },
    signatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 8,
    },
    signatureName: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    signatureDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    noSignatureText: {
        color: '#94A3B8',
        fontStyle: 'italic',
        fontSize: 13,
    },
    signBtn: {
        backgroundColor: '#6366F1',
        borderRadius: 14,
    },
    signedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D1FAE5',
        padding: 14,
        borderRadius: 14,
        gap: 8,
    },
    signedText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 15,
    },
});
