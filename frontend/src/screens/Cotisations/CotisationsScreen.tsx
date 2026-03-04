import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator,
    TouchableOpacity, Modal, TextInput, Animated, ScrollView
} from 'react-native';
import { theme } from '../../theme';
import { useCotisationStore } from '../../store/useCotisationStore';
import { apiClient } from '../../api/client';
import { useRoute } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import {
    CheckCircle2, Clock, AlertCircle, CreditCard, TrendingUp, ArrowUpCircle,
    ChevronRight, Phone, Smartphone, X, Shield, Loader, CheckCircle, Wifi, ArrowLeft
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export const CotisationsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { tontineId } = route.params;

    const { cotisations, isLoading, fetchCotisations, payerCotisation } = useCotisationStore();

    // Payment modal state
    const [showPayment, setShowPayment] = useState(false);
    const [selectedCotisation, setSelectedCotisation] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedOperateur, setSelectedOperateur] = useState('ORANGE_MONEY'); // Opérateur sélectionné
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
        setSelectedOperateur('ORANGE_MONEY'); // Réinitialiser à Orange Money
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
            const success = await payerCotisation(selectedCotisation.id, selectedOperateur);
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
                                <Text style={styles.cycleTitle}>
                                    {item.beneficiairePrenom ? `Tour de ${item.beneficiairePrenom} ${item.beneficiaireNom}` : `Tour ${item.cycleNumero}`}
                                </Text>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={22} />
                    </TouchableOpacity>
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
                                            {selectedCotisation?.beneficiairePrenom ? `Tour de ${selectedCotisation.beneficiairePrenom} ${selectedCotisation.beneficiaireNom}` : `Tour ${selectedCotisation?.cycleNumero}`} — Échéance : {selectedCotisation ? new Date(selectedCotisation.datePrevue).toLocaleDateString('fr-FR') : ''}
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
                                        <TouchableOpacity 
                                            style={[styles.methodCard, selectedOperateur === 'ORANGE_MONEY' && styles.methodCardActive]}
                                            onPress={() => setSelectedOperateur('ORANGE_MONEY')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.methodIconContainer}>
                                                <SvgXml xml={ORANGE_SVG} width={32} height={32} />
                                            </View>
                                            <Text style={styles.methodName}>Orange Money</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.methodCard, selectedOperateur === 'MOOV_MONEY' && styles.methodCardActive]}
                                            onPress={() => setSelectedOperateur('MOOV_MONEY')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.methodIconContainer}>
                                                <SvgXml xml={MOOV_SVG} width={32} height={32} />
                                            </View>
                                            <Text style={styles.methodName}>Moov Money</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.methodCard, selectedOperateur === 'CORIS_MONEY' && styles.methodCardActive]}
                                            onPress={() => setSelectedOperateur('CORIS_MONEY')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.methodIconContainer}>
                                                <SvgXml xml={CORIS_SVG} width={32} height={32} />
                                            </View>
                                            <Text style={styles.methodName}>Coris Money</Text>
                                        </TouchableOpacity>
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
                                        <Text style={styles.successLabel}>Tour</Text>
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

const ORANGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="800" width="1200" viewBox="-22.35 -9.987675 193.7 59.92605"><g fill-rule="evenodd" fill="none"><path fill="#000" d="M31.2955 4.0185H8.458c-2.5608 0-4.6366 2.0759-4.6366 4.6367 0 2.5608 2.0758 4.6366 4.6366 4.6366h11.6438L1.3582 32.0356c-1.811 1.8104-1.811 4.7462 0 6.5571 1.8106 1.8107 4.7464 1.8107 6.557 0l18.7436-18.7436v11.6435c0 2.5608 2.0759 4.6367 4.6367 4.6367 2.5608 0 4.6366-2.0759 4.6366-4.6367V8.6552c0-2.5608-2.0758-4.6367-4.6366-4.6367"/><path fill="#FF7900" d="M44.642 35.9321h22.8375c2.5608 0 4.6367-2.0758 4.6367-4.6366 0-2.5608-2.0759-4.6367-4.6367-4.6367H55.8358L74.5794 7.9152c1.8109-1.8106 1.8109-4.7464 0-6.557-1.8107-1.811-4.7464-1.811-6.557 0L49.2786 20.1018V8.458c0-2.5608-2.0758-4.6366-4.6366-4.6366-2.5608 0-4.6367 2.0758-4.6367 4.6366v22.8375c0 2.5608 2.0759 4.6366 4.6367 4.6366"/><path fill="#000" d="M92.5 15.4802c2.6111 0 3.5927-2.246 3.5927-4.4733 0-2.3396-.9816-4.5857-3.5927-4.5857-2.611 0-3.5926 2.246-3.5926 4.5857 0 2.2272.9816 4.4733 3.5926 4.4733m0-11.5295c4.0927 0 6.5 3.0882 6.5 7.0562 0 3.8556-2.4073 6.9438-6.5 6.9438-4.0926 0-6.5-3.0882-6.5-6.9438 0-3.968 2.4074-7.0562 6.5-7.0562m7.5 4.2637h2.4323v1.808h.036c.4686-1.2241 1.7298-2.0717 2.9731-2.0717.1803 0 .3964.0379.5586.0944v2.4857c-.2344-.0565-.6127-.0941-.919-.0941-1.8737 0-2.5224 1.4123-2.5224 3.1262v4.3878H100zm13.8256 4.8372c-.4761.3853-1.4685.4037-2.3413.5505-.873.165-1.6666.4403-1.6666 1.3945 0 .9725.8132 1.211 1.7261 1.211 2.2023 0 2.2818-1.6147 2.2818-2.1834zm-6.5081-1.9265c.159-2.4403 2.5202-3.1744 4.8213-3.1744 2.0436 0 4.504.4219 4.504 2.6972v4.936c0 .8622.0991 1.7244.3572 2.1099h-2.857c-.0994-.2936-.1786-.6055-.1986-.9173-.8927.8622-2.202 1.1742-3.4522 1.1742-1.9442 0-3.4922-.899-3.4922-2.844 0-2.1468 1.7464-2.6606 3.4922-2.8809 1.7261-.2385 3.3334-.1834 3.3334-1.2477 0-1.1191-.8334-1.2843-1.8256-1.2843-1.0713 0-1.7654.4037-1.8649 1.4313zM118 8.2144h2.505v1.356h.056c.6679-1.0923 1.8186-1.6197 2.9317-1.6197 2.8022 0 3.5073 1.6008 3.5073 4.0114v5.9886h-2.635v-5.4989c0-1.6008-.464-2.3918-1.6886-2.3918-1.4289 0-2.0413.81-2.0413 2.7872v5.1035h-2.635zm17.3683 4.8589c0-1.6176-.5652-3.062-2.3585-3.062-1.5595 0-2.2417 1.3482-2.2417 2.8308 0 1.425.5459 2.9849 2.2417 2.9849 1.5792 0 2.3585-1.3289 2.3585-2.7537zM138 17.5408c0 1.6369-.585 4.4099-5.2242 4.4099-1.9881 0-4.3077-.9245-4.4443-3.1967h2.7484c.2534 1.0205 1.0918 1.3673 2.0663 1.3673 1.5402 0 2.2417-1.0399 2.2221-2.465V16.347h-.0389c-.604 1.0398-1.8129 1.5407-3.0214 1.5407-3.0214 0-4.308-2.2725-4.308-5.007 0-2.5806 1.501-4.9299 4.3276-4.9299 1.3255 0 2.339.443 3.0018 1.5985h.039v-1.329H138zm8.2318-5.6085c-.252-1.3212-.8531-2.0182-2.191-2.0182-1.745 0-2.2489 1.2843-2.2879 2.0182zm-4.4789 1.6513c.0777 1.6514.9308 2.4037 2.4625 2.4037 1.105 0 1.997-.6424 2.1712-1.2295h2.4238c-.7757 2.2388-2.4238 3.1929-4.692 3.1929-3.1601 0-5.1184-2.055-5.1184-4.991 0-2.8438 2.0746-5.009 5.1185-5.009 3.4122 0 5.0602 2.7154 4.8662 5.633z13.1791 5.1908c-.5839 1.5434-1.5067 2.1761-3.3523 2.1761-.5461 0-1.0924-.0374-1.6385-.0932v-2.1759c.5085.0372 1.0359.1117 1.563.093.9228-.093 1.2241-1.0414.9228-1.8039L133 25.9507h2.8626l2.2034 6.5837h.0376l2.1283-6.5837H143z"/></g></svg>`;

const MOOV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="520" height="520">
  <polygon points="260,20 500,260 260,500 20,260" fill="#F47920"/>
  <polygon points="260,42 478,260 260,478 42,260" fill="none" stroke="white" stroke-width="7"/>
  <text x="252" y="228" font-family="'Arial Black', 'Helvetica Neue', sans-serif" font-size="80" font-weight="900" fill="#1565C0" text-anchor="middle" letter-spacing="4">MOOV</text>
  <text x="245" y="318" font-family="'Arial Black', 'Helvetica Neue', sans-serif" font-size="100" font-weight="900" font-style="italic" fill="white" text-anchor="middle" letter-spacing="-2">Money</text>
  <g transform="translate(390, 285)">
    <g transform="rotate(20, 0, 10)">
      <rect x="-4" y="0" width="46" height="30" rx="4" fill="white" opacity="0.45"/>
    </g>
    <g transform="rotate(10, 0, 10)">
      <rect x="-2" y="0" width="46" height="30" rx="4" fill="white" opacity="0.70"/>
    </g>
    <rect x="0" y="0" width="46" height="30" rx="4" fill="white"/>
    <line x1="6" y1="10" x2="40" y2="10" stroke="#F47920" stroke-width="3" stroke-linecap="round"/>
    <line x1="6" y1="18" x2="40" y2="18" stroke="#F47920" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </g>
</svg>`;

const CORIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="93.582" viewBox="0 0 80 93.582"><defs><pattern id="pattern" preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 1184 1408"><image width="1184" height="1408" href="data:image/png;base64,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CBAQQFkDBAgQIECAAAECBAgQIECAAAECqQoIoFLl1TgBAgQIECBAgAABAgQIECBAgIAAyhogQIAAAQIECBAgQIAAAQIECBBIVUAAlSqvxgkQIECAAAECBAgQIECAAAECBARQ1gABAgQIECBAgAABAgQIECBAgECqAgKoVHk1ToAAAQIECBAgQIAAAQIECBAgIICyBggQIECAAAECBAgQIECAAAECBFIVEEClyqtxAgQIECBAgAABAgQIECBAgAABAZQ1QIAAAQIECBAgQIAAAQIECBAgkKqAACpVXo0TIECAAAECBAgQIECAAAECBAgIoKwBAgQIECBAgAABAgQIECBAgACBVAUEUKnyapwAAQIECBAgQIAAAQIECBAgQEAAZQ0QIECAAAECBAgQIECAAAECBAikKiCASpVX4wQIECBAgAABAgQIECBAgAABAgIoa4AAAQIECBAgQIAAAQIECBAgQCBVAQFUqrwaJ0CAAAECBAgQIECAAAECBAgQEEBZAwQIECBAgAABAgQIECBAgAABAqkKCKBS5dU4AQIECBAgQIAAAQIECBAgQICAAMoaIECAAAECBAgQIECAAAECBAgQSFVAAJUqr8YJECBAgAABAgQIECBAgAABAgQEUNYAAQIECBAgQIAAAQIECBAgQIBAqgICqFR5NU6AAAECBAgQIECAAAECBAgQICCAsgYIECBAgAABAgQIECBAgAABAgRSFRBApcqrcQIECBAgQIAAAQIECBAgQIAAAQGUNUCAAAECBAgQIECAAAECBAgQIJCqgAAqVV6NEyBAgAABAgQIECBAgAABAgQICKCsAQIECBAgQIAAAQIECBAgQIAAgVQFBFCp8mqcAAECBAgQIECAAAECBAgQIEBAAGUNECBAgAABAgQIECBAgAABAgQIpCoggEqVV+MECBAgQIAAAQIECBAgQIAAAQICKGuAAAECBAgQIECAAAECBAgQIEAgVQEBVKq8GidAgAABAgQIECBAgAABAgQIEBBAWQMECBAgQIAAAQIECBAgQIAAAQKpCgigUuXVOAECBAgQIECAAAECBAgQIEBAAgUAWp37AAAAAElFTkSuQmCC"></image></pattern></defs><rect id="Signature_sans_slogan" data-name="Signature sans slogan" width="80" height="93.582" fill="url(#pattern)"></rect></svg>`;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    headerBg: { backgroundColor: '#1E1B4B' },
    headerContent: { alignItems: 'center', padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 16, top: 22, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
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
    methodIconContainer: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
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
