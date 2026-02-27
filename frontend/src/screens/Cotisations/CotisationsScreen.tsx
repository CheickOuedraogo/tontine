import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator,
    TouchableOpacity, Modal, TextInput, Animated, ScrollView
} from 'react-native';
import { theme } from '../../theme';
import { useCotisationStore } from '../../store/useCotisationStore';
import { apiClient } from '../../api/client';
import { useRoute } from '@react-navigation/native';
import {
    CheckCircle2, Clock, AlertCircle, CreditCard, TrendingUp, ArrowUpCircle,
    ChevronRight, Phone, Smartphone, X, Shield, Loader, CheckCircle, Wifi
} from 'lucide-react-native';

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export const CotisationsScreen = () => {
    const route = useRoute<any>();
    const { tontineId } = route.params;

    const { cotisations, isLoading, fetchCotisations, payerCotisation } = useCotisationStore();

    // Payment modal state
    const [showPayment, setShowPayment] = useState(false);
    const [selectedCotisation, setSelectedCotisation] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [creatorPhone, setCreatorPhone] = useState('');
    const [creatorName, setCreatorName] = useState('');
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('form');
    const [processingText, setProcessingText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [simRef, setSimRef] = useState('');
    const spinAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchCotisations(tontineId);
    }, [tontineId]);

    // Fetch creator info
    useEffect(() => {
        apiClient.get(`/tontines/${tontineId}`).then(res => {
            const t = res.data.tontine || res.data;
            if (t && t.creatorId) {
                // Get creator details (phone from the tontine members)
                apiClient.get(`/tontines/${tontineId}/membres`).then(mRes => {
                    const membres = mRes.data.membres || mRes.data.data || [];
                    const creator = membres.find((m: any) => m.userId === t.creatorId);
                    if (creator) {
                        setCreatorPhone(creator.telephone || '+226 XX XX XX XX');
                        setCreatorName(`${creator.prenom || ''} ${creator.nom || ''}`);
                    }
                }).catch(() => { });
            }
        }).catch(() => { });
    }, [tontineId]);

    const openPayment = (cotisation: any) => {
        setSelectedCotisation(cotisation);
        setPhoneNumber('');
        setPaymentStep('form');
        setShowPayment(true);
    };

    // Spin animation
    const startSpin = () => {
        spinAnim.setValue(0);
        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: false })
        ).start();
    };

    const handlePayment = async () => {
        if (!phoneNumber || phoneNumber.length < 8) {
            setErrorText('Veuillez entrer un numéro de téléphone valide');
            return;
        }

        setPaymentStep('processing');
        startSpin();
        const ref = `TF-${Date.now().toString(36).toUpperCase()}`;
        setSimRef(ref);

        // Step 1: Connecting
        setProcessingText('Connexion au service Mobile Money...');
        await delay(1500);

        // Step 2: Verification
        setProcessingText('Vérification du numéro ' + phoneNumber + '...');
        await delay(1200);

        // Step 3: Authorization
        setProcessingText('Demande d\'autorisation de paiement...');
        await delay(1500);

        // Step 4: Transfer
        setProcessingText(`Transfert de ${Number(selectedCotisation.montant).toLocaleString('fr-FR')} FCFA en cours...`);
        await delay(2000);

        // Step 5: Confirmation
        setProcessingText('Confirmation du paiement...');
        await delay(1000);

        // Actually pay
        try {
            const success = await payerCotisation(selectedCotisation.id);
            if (success) {
                setPaymentStep('success');
                progressAnim.setValue(0);
                Animated.timing(progressAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
            } else {
                setPaymentStep('error');
                setErrorText('Le paiement a échoué. Veuillez réessayer.');
            }
        } catch {
            setPaymentStep('error');
            setErrorText('Erreur de connexion. Veuillez réessayer.');
        }
    };

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return <CheckCircle2 color="#059669" size={22} />;
            case 'EN_RETARD': return <AlertCircle color="#DC2626" size={22} />;
            default: return <Clock color="#D97706" size={22} />;
        }
    };

    const getStatusInfo = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return { label: 'Payée', bg: '#D1FAE5', color: '#059669' };
            case 'EN_RETARD': return { label: 'En retard', bg: '#FEE2E2', color: '#DC2626' };
            default: return { label: 'En attente', bg: '#FEF3C7', color: '#D97706' };
        }
    };

    const totalPaid = (cotisations || []).filter((c: any) => c.statut === 'PAYEE').length;
    const totalPending = (cotisations || []).filter((c: any) => c.statut !== 'PAYEE').length;
    const totalAmount = (cotisations || []).filter((c: any) => c.statut === 'PAYEE').reduce((s: number, c: any) => s + Number(c.montant), 0);

    const renderItem = ({ item }: { item: any }) => {
        const isPayee = item.statut === 'PAYEE';
        const statusInfo = getStatusInfo(item.statut);

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: statusInfo.color }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                        <View style={styles.cardTopLeft}>
                            {getStatusIcon(item.statut)}
                            <View>
                                <Text style={styles.cycleTitle}>Cycle {item.cycleNumero}</Text>
                                <Text style={styles.cycleDate}>
                                    {new Date(item.datePrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.amount}>{Number(item.montant).toLocaleString('fr-FR')}</Text>
                        <Text style={styles.amountUnit}>FCFA</Text>
                    </View>

                    {isPayee && item.datePaiement && (
                        <Text style={styles.paidDate}>
                            Payé le {new Date(item.datePaiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}

                    {!isPayee && (
                        <TouchableOpacity
                            style={styles.payBtn}
                            onPress={() => openPayment(item)}
                            activeOpacity={0.8}
                        >
                            <Smartphone color="#FFFFFF" size={16} />
                            <Text style={styles.payBtnText}>Payer ma contribution</Text>
                            <ChevronRight color="#FFFFFF" size={16} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerBg}>
                <View style={styles.headerContent}>
                    <View style={styles.headerIcon}>
                        <CreditCard color="#FFFFFF" size={24} />
                    </View>
                    <Text style={styles.headerTitle}>Mes Cotisations</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <ArrowUpCircle color="#34D399" size={18} />
                            <Text style={styles.statNumber}>{totalPaid}</Text>
                            <Text style={styles.statLabel}>Payées</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Clock color="#FBBF24" size={18} />
                            <Text style={styles.statNumber}>{totalPending}</Text>
                            <Text style={styles.statLabel}>En attente</Text>
                        </View>
                        <View style={styles.statCard}>
                            <TrendingUp color="#A78BFA" size={18} />
                            <Text style={styles.statNumber}>{totalAmount > 0 ? totalAmount.toLocaleString('fr-FR') : '0'}</Text>
                            <Text style={styles.statLabel}>FCFA total</Text>
                        </View>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={cotisations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <CreditCard color="#6366F1" size={36} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucune cotisation</Text>
                            <Text style={styles.emptyText}>Les cotisations seront générées une fois la tontine démarrée.</Text>
                        </View>
                    }
                />
            )}

            {/* Payment Modal */}
            <Modal visible={showPayment} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {paymentStep === 'form' && (
                            <>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Smartphone color="#6366F1" size={20} />
                                    <Text style={styles.modalTitle}>Paiement Mobile Money</Text>
                                    <TouchableOpacity onPress={() => setShowPayment(false)} style={styles.modalClose}>
                                        <X color="#64748B" size={18} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    {/* Amount summary */}
                                    <View style={styles.amountBanner}>
                                        <Text style={styles.amountBannerLabel}>Montant à payer</Text>
                                        <Text style={styles.amountBannerValue}>
                                            {selectedCotisation ? Number(selectedCotisation.montant).toLocaleString('fr-FR') : '0'} FCFA
                                        </Text>
                                        <Text style={styles.amountBannerCycle}>
                                            Cycle {selectedCotisation?.cycleNumero} — Échéance : {selectedCotisation ? new Date(selectedCotisation.datePrevue).toLocaleDateString('fr-FR') : ''}
                                        </Text>
                                    </View>

                                    {/* Phone input */}
                                    <Text style={styles.inputLabel}>Votre numéro Mobile Money</Text>
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputPrefix}>
                                            <Phone color="#6366F1" size={16} />
                                            <Text style={styles.prefixText}>+226</Text>
                                        </View>
                                        <TextInput
                                            style={styles.phoneInput}
                                            placeholder="70 XX XX XX"
                                            placeholderTextColor="#94A3B8"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            maxLength={12}
                                        />
                                    </View>

                                    {/* Creator info */}
                                    <Text style={styles.inputLabel}>Destinataire (Créateur de la tontine)</Text>
                                    <View style={styles.recipientCard}>
                                        <View style={styles.recipientAvatar}>
                                            <Text style={styles.recipientAvatarText}>
                                                {creatorName ? creatorName.charAt(0).toUpperCase() : 'C'}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.recipientName}>{creatorName || 'Créateur'}</Text>
                                            <Text style={styles.recipientPhone}>{creatorPhone || '+226 XX XX XX XX'}</Text>
                                        </View>
                                        <Shield color="#059669" size={16} />
                                    </View>

                                    {/* Payment method */}
                                    <Text style={styles.inputLabel}>Méthode de paiement</Text>
                                    <View style={styles.methodsRow}>
                                        <View style={[styles.methodCard, styles.methodCardActive]}>
                                            <Text style={styles.methodEmoji}>🟠</Text>
                                            <Text style={styles.methodName}>Orange Money</Text>
                                        </View>
                                        <View style={styles.methodCard}>
                                            <Text style={styles.methodEmoji}>🔵</Text>
                                            <Text style={styles.methodName}>Moov Money</Text>
                                        </View>
                                        <View style={styles.methodCard}>
                                            <Text style={styles.methodEmoji}>🟢</Text>
                                            <Text style={styles.methodName}>Coris Money</Text>
                                        </View>
                                    </View>

                                    {errorText && paymentStep === 'form' ? (
                                        <View style={styles.errorBanner}>
                                            <AlertCircle color="#DC2626" size={14} />
                                            <Text style={styles.errorBannerText}>{errorText}</Text>
                                        </View>
                                    ) : null}

                                    {/* Security note */}
                                    <View style={styles.securityNote}>
                                        <Shield color="#6366F1" size={14} />
                                        <Text style={styles.securityText}>
                                            Transaction sécurisée et chiffrée. Un SMS de confirmation sera envoyé.
                                        </Text>
                                    </View>
                                </ScrollView>

                                {/* Pay button */}
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={[styles.confirmPayBtn, !phoneNumber && styles.confirmPayBtnDisabled]}
                                        onPress={handlePayment}
                                        disabled={!phoneNumber}
                                        activeOpacity={0.7}
                                    >
                                        <CreditCard color="#FFFFFF" size={18} />
                                        <Text style={styles.confirmPayBtnText}>
                                            Payer {selectedCotisation ? Number(selectedCotisation.montant).toLocaleString('fr-FR') : ''} FCFA
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {paymentStep === 'processing' && (
                            <View style={styles.processingView}>
                                <Animated.View style={[styles.spinnerCircle, { transform: [{ rotate: spinInterpolate }] }]}>
                                    <Wifi color="#6366F1" size={28} />
                                </Animated.View>
                                <Text style={styles.processingTitle}>Traitement en cours</Text>
                                <Text style={styles.processingText}>{processingText}</Text>
                                <View style={styles.processingBar}>
                                    <View style={styles.processingBarInner} />
                                </View>
                                <Text style={styles.processingRef}>Réf : {simRef}</Text>
                                <Text style={styles.processingWarn}>Ne fermez pas cette fenêtre</Text>
                            </View>
                        )}

                        {paymentStep === 'success' && (
                            <View style={styles.successView}>
                                <View style={styles.successIconCircle}>
                                    <CheckCircle color="#FFFFFF" size={36} />
                                </View>
                                <Text style={styles.successTitle}>Paiement réussi !</Text>
                                <Text style={styles.successAmount}>
                                    {selectedCotisation ? Number(selectedCotisation.montant).toLocaleString('fr-FR') : '0'} FCFA
                                </Text>
                                <View style={styles.successDetails}>
                                    <View style={styles.successRow}>
                                        <Text style={styles.successLabel}>Référence</Text>
                                        <Text style={styles.successValue}>{simRef}</Text>
                                    </View>
                                    <View style={styles.successRow}>
                                        <Text style={styles.successLabel}>Cycle</Text>
                                        <Text style={styles.successValue}>{selectedCotisation?.cycleNumero}</Text>
                                    </View>
                                    <View style={styles.successRow}>
                                        <Text style={styles.successLabel}>De</Text>
                                        <Text style={styles.successValue}>+226 {phoneNumber}</Text>
                                    </View>
                                    <View style={styles.successRow}>
                                        <Text style={styles.successLabel}>Vers</Text>
                                        <Text style={styles.successValue}>{creatorName}</Text>
                                    </View>
                                    <View style={styles.successRow}>
                                        <Text style={styles.successLabel}>Date</Text>
                                        <Text style={styles.successValue}>{new Date().toLocaleString('fr-FR')}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.successCloseBtn}
                                    onPress={() => { setShowPayment(false); fetchCotisations(tontineId); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.successCloseBtnText}>Fermer</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {paymentStep === 'error' && (
                            <View style={styles.errorView}>
                                <View style={styles.errorIconCircle}>
                                    <AlertCircle color="#FFFFFF" size={36} />
                                </View>
                                <Text style={styles.errorTitle}>Échec du paiement</Text>
                                <Text style={styles.errorMsg}>{errorText}</Text>
                                <TouchableOpacity
                                    style={styles.retryBtn}
                                    onPress={() => { setPaymentStep('form'); setErrorText(''); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.retryBtnText}>Réessayer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowPayment(false)}
                                    style={{ marginTop: 12 }}
                                >
                                    <Text style={styles.cancelText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    headerBg: { backgroundColor: '#1E1B4B' },
    headerContent: { alignItems: 'center', padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' },
    headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 14, letterSpacing: -0.3 },
    statsRow: { flexDirection: 'row', gap: 10, width: '100%' },
    statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statNumber: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 4 },
    statLabel: { fontSize: 10, color: '#A5B4FC', marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    list: { padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
    card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', elevation: 3 },
    cardAccent: { width: 5 },
    cardContent: { flex: 1, padding: 16 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cycleTitle: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
    cycleDate: { fontSize: 12, color: '#64748B', marginTop: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 },
    amount: { fontSize: 22, fontWeight: '900', color: '#1E1B4B' },
    amountUnit: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    paidDate: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 2 },
    payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 10, gap: 8 },
    payBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, flex: 1 },
    emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0px 4px 24px rgba(0,0,0,0.06)', elevation: 3, marginTop: 8 },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 6 },
    emptyText: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '92%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
    modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    modalBody: { padding: 16 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },

    // Amount banner
    amountBanner: { backgroundColor: '#1E1B4B', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 20 },
    amountBannerLabel: { fontSize: 11, color: '#A5B4FC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    amountBannerValue: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginTop: 4 },
    amountBannerCycle: { fontSize: 12, color: '#C7D2FE', marginTop: 6 },

    // Inputs
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    inputGroup: { flexDirection: 'row', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
    inputPrefix: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, backgroundColor: '#F8FAFC', borderRightWidth: 1, borderRightColor: '#E2E8F0' },
    prefixText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
    phoneInput: { flex: 1, height: 48, paddingHorizontal: 14, fontSize: 16, color: '#1E293B', fontWeight: '600' },

    // Recipient
    recipientCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 },
    recipientAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
    recipientAvatarText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    recipientName: { fontSize: 14, fontWeight: '700', color: '#166534' },
    recipientPhone: { fontSize: 12, color: '#4ADE80', marginTop: 1 },

    // Methods
    methodsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    methodCard: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
    methodCardActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
    methodEmoji: { fontSize: 20, marginBottom: 4 },
    methodName: { fontSize: 10, fontWeight: '700', color: '#374151' },

    // Error banner
    errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
    errorBannerText: { fontSize: 12, color: '#DC2626', flex: 1 },

    // Security
    securityNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#EEF2FF', borderRadius: 10 },
    securityText: { fontSize: 11, color: '#6366F1', flex: 1, lineHeight: 16 },

    // Pay button
    confirmPayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', borderRadius: 12, paddingVertical: 14 },
    confirmPayBtnDisabled: { backgroundColor: '#CBD5E1' },
    confirmPayBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

    // Processing
    processingView: { alignItems: 'center', padding: 40, paddingVertical: 50 },
    spinnerCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#E0E7FF', borderTopColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    processingTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 8 },
    processingText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 },
    processingBar: { width: '80%', height: 4, backgroundColor: '#E0E7FF', borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
    processingBarInner: { width: '60%', height: '100%', backgroundColor: '#6366F1', borderRadius: 2 },
    processingRef: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' },
    processingWarn: { fontSize: 11, color: '#F59E0B', fontWeight: '600', marginTop: 8 },

    // Success
    successView: { alignItems: 'center', padding: 30, paddingVertical: 40 },
    successIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    successTitle: { fontSize: 20, fontWeight: '900', color: '#059669', marginBottom: 4 },
    successAmount: { fontSize: 28, fontWeight: '900', color: '#1E1B4B', marginBottom: 16 },
    successDetails: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 20 },
    successRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    successLabel: { fontSize: 12, color: '#64748B' },
    successValue: { fontSize: 12, fontWeight: '700', color: '#1E1B4B' },
    successCloseBtn: { backgroundColor: '#059669', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
    successCloseBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

    // Error
    errorView: { alignItems: 'center', padding: 30, paddingVertical: 40 },
    errorIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    errorTitle: { fontSize: 20, fontWeight: '900', color: '#DC2626', marginBottom: 8 },
    errorMsg: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 },
    retryBtn: { backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
    retryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    cancelText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
});
