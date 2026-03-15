import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCotisationStore } from '../../store/useCotisationStore';
import { apiClient } from '../../api/client';
import {
    CheckCircle2, Clock, AlertCircle, CreditCard, TrendingUp, ArrowUpCircle,
    ChevronRight, Phone, Smartphone, X, Shield, CheckCircle, Wifi, ArrowLeft
} from 'lucide-react';
import './CotisationsScreen.css';

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export const CotisationsScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { cotisations, isLoading, fetchCotisations, payerCotisation } = useCotisationStore();

    // Payment modal state
    const [showPayment, setShowPayment] = useState(false);
    const [selectedCotisation, setSelectedCotisation] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedOperateur, setSelectedOperateur] = useState('ORANGE_MONEY');
    const [creatorPhone, setCreatorPhone] = useState('');
    const [creatorName, setCreatorName] = useState('');
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('form');
    const [processingText, setProcessingText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [simRef, setSimRef] = useState('');

    const loadData = useCallback(() => {
        if (tontineId) {
            fetchCotisations(tontineId);
        }
    }, [tontineId, fetchCotisations]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Fetch creator info
    useEffect(() => {
        if (!tontineId) return;
        apiClient.get(`/tontines/${tontineId}`).then(res => {
            const t = res.data.tontine || res.data;
            if (t && t.creatorId) {
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
        setSelectedOperateur('ORANGE_MONEY');
        setPaymentStep('form');
        setShowPayment(true);
    };

    const handlePayment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 8) {
            setErrorText('Veuillez entrer un numéro de téléphone valide');
            return;
        }

        setPaymentStep('processing');
        const ref = `TF-${Date.now().toString(36).toUpperCase()}`;
        setSimRef(ref);

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        setProcessingText('Connexion au service Mobile Money...');
        await delay(1500);
        setProcessingText('Vérification du numéro ' + phoneNumber + '...');
        await delay(1200);
        setProcessingText('Demande d\'autorisation de paiement...');
        await delay(1500);
        setProcessingText(`Transfert de ${Number(selectedCotisation.montant).toLocaleString('fr-FR')} FCFA en cours...`);
        await delay(2000);
        setProcessingText('Confirmation du paiement...');
        await delay(1000);

        try {
            const success = await payerCotisation(selectedCotisation.id, ref, selectedOperateur);
            if (success) {
                setPaymentStep('success');
            } else {
                setPaymentStep('error');
                setErrorText('Le paiement a échoué. Veuillez réessayer.');
            }
        } catch {
            setPaymentStep('error');
            setErrorText('Erreur de connexion. Veuillez réessayer.');
        }
    };

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

    return (
        <div className="cotisations-page">
            <header className="details-header cotisations-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Mes Cotisations</h1>
                    <div className="header-stats-web">
                        <div className="stat-pill">
                            <ArrowUpCircle size={16} color="#34D399" />
                            <span style={{ color: '#000000ff' }}>{totalPaid} Payées</span>
                        </div>
                        <div className="stat-pill">
                            <Clock size={16} color="#FBBF24" />
                            <span style={{ color: '#000000ff' }}>{totalPending} En attente</span>
                        </div>
                        <div className="stat-pill">
                            <TrendingUp size={16} color="#A78BFA" />
                            <span style={{ color: '#000000ff' }}>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="cotisations-list-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement des cotisations...</p>
                    </div>
                ) : (
                    <div className="cotisations-grid">
                        {cotisations.map((item: any) => {
                            const isPayee = item.statut === 'PAYEE';
                            const statusInfo = getStatusInfo(item.statut);
                            return (
                                <div key={item.id} className="cotisation-card-web premium-card">
                                    <div className="card-status-accent" style={{ background: statusInfo.color }}></div>
                                    <div className="card-main-content">
                                        <div className="card-header-web">
                                            <div className="header-left-web">
                                                {getStatusIcon(item.statut)}
                                                <div className="tour-info">
                                                    <span className="tour-name">
                                                        {item.beneficiairePrenom ? `Tour de ${item.beneficiairePrenom} ${item.beneficiaireNom}` : `Tour ${item.cycleNumero}`}
                                                    </span>
                                                    <span className="tour-date">
                                                        {new Date(item.datePrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="status-badge-web" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="amount-display-web">
                                            <span className="amount-value">{Number(item.montant).toLocaleString('fr-FR')}</span>
                                            <span className="amount-currency">FCFA</span>
                                        </div>

                                        {isPayee && item.datePaiement && (
                                            <div className="payment-confirmation-web">
                                                <CheckCircle size={14} />
                                                <span>Payé le {new Date(item.datePaiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}

                                        {!isPayee && (
                                            <button className="pay-now-btn" onClick={() => openPayment(item)}>
                                                <Smartphone size={16} />
                                                <span>Payer ma contribution</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {cotisations.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <CreditCard size={36} />
                                </div>
                                <h3>Aucune cotisation</h3>
                                <p>Les cotisations seront générées une fois la tontine démarrée.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="modal-overlay-web">
                    <div className="modal-content-web premium-card">
                        {paymentStep === 'form' && (
                            <div className="payment-form-step">
                                <div className="modal-header-web">
                                    <div className="title-with-icon">
                                        <Smartphone size={20} color="var(--primary)" />
                                        <h2>Paiement Mobile Money</h2>
                                    </div>
                                    <button className="close-modal-btn" onClick={() => setShowPayment(false)}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="modal-body-web">
                                    <div className="amount-summary-banner">
                                        <span className="summary-label">Montant à payer</span>
                                        <span className="summary-value">{Number(selectedCotisation.montant).toLocaleString('fr-FR')} FCFA</span>
                                        <span className="summary-details">
                                            {selectedCotisation?.beneficiairePrenom ? `Tour de ${selectedCotisation.beneficiairePrenom} ${selectedCotisation.beneficiaireNom}` : `Tour ${selectedCotisation?.cycleNumero}`}
                                        </span>
                                    </div>

                                    <form onSubmit={handlePayment} className="payment-inputs">
                                        <div className="input-field-web">
                                            <label>Votre numéro Mobile Money</label>
                                            <div className="phone-prefix-input">
                                                <div className="prefix-badge">
                                                    <Phone size={16} />
                                                    <span>+226</span>
                                                </div>
                                                <input 
                                                    type="tel" 
                                                    placeholder="70 XX XX XX" 
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="recipient-info-card">
                                            <div className="recipient-avatar-web">
                                                {creatorName ? creatorName.charAt(0).toUpperCase() : 'C'}
                                            </div>
                                            <div className="recipient-text-web">
                                                <span className="label-r">Destinataire</span>
                                                <span className="name-r">{creatorName || 'Créateur'}</span>
                                                <span className="phone-r">{creatorPhone}</span>
                                            </div>
                                            <Shield size={16} color="var(--success)" />
                                        </div>

                                        <div className="operator-selector-web">
                                            <label>Méthode de paiement</label>
                                            <div className="operators-grid">
                                                <div 
                                                    className={`operator-card ${selectedOperateur === 'ORANGE_MONEY' ? 'active' : ''}`}
                                                    onClick={() => setSelectedOperateur('ORANGE_MONEY')}
                                                >
                                                    <div className="op-logo orange"></div>
                                                    <span>Orange Money</span>
                                                </div>
                                                <div 
                                                    className={`operator-card ${selectedOperateur === 'MOOV_MONEY' ? 'active' : ''}`}
                                                    onClick={() => setSelectedOperateur('MOOV_MONEY')}
                                                >
                                                    <div className="op-logo moov"></div>
                                                    <span>Moov Money</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer-web">
                                    <button 
                                        className="confirm-pay-btn" 
                                        onClick={handlePayment}
                                        disabled={!phoneNumber || phoneNumber.length < 8}
                                    >
                                        <CreditCard size={20} />
                                        <span>Payer {Number(selectedCotisation.montant).toLocaleString('fr-FR')} FCFA</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentStep === 'processing' && (
                            <div className="payment-status-step central">
                                <div className="spinner-loader">
                                    <Wifi size={32} />
                                </div>
                                <div className="status-text-block">
                                    <h3>Traitement en cours</h3>
                                    <p>{processingText}</p>
                                </div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill"></div>
                                </div>
                                <div className="payment-meta">
                                    <span className="ref-tag">Réf : {simRef}</span>
                                    <span className="wait-warning">Ne fermez pas cette fenêtre</span>
                                </div>
                            </div>
                        )}

                        {paymentStep === 'success' && (
                            <div className="payment-status-step central success">
                                <div className="success-icon-main">
                                    <CheckCircle size={40} />
                                </div>
                                <h3>Paiement réussi !</h3>
                                <div className="success-amount-pill">{Number(selectedCotisation.montant).toLocaleString('fr-FR')} FCFA</div>
                                
                                <div className="receipt-details">
                                    <div className="receipt-row"><span>Référence</span><strong>{simRef}</strong></div>
                                    <div className="receipt-row"><span>Tour</span><strong>{selectedCotisation?.cycleNumero}</strong></div>
                                    <div className="receipt-row"><span>Vers</span><strong>{creatorName}</strong></div>
                                    <div className="receipt-row"><span>Date</span><strong>{new Date().toLocaleString('fr-FR')}</strong></div>
                                </div>

                                <button className="close-success-btn" onClick={() => { setShowPayment(false); loadData(); }}>
                                    Fermer
                                </button>
                            </div>
                        )}

                        {paymentStep === 'error' && (
                            <div className="payment-status-step central error">
                                <div className="error-icon-main">
                                    <AlertCircle size={40} />
                                </div>
                                <h3>Échec du paiement</h3>
                                <p>{errorText}</p>
                                <div className="error-actions-modal">
                                    <button className="retry-btn-modal" onClick={() => setPaymentStep('form')}>Réessayer</button>
                                    <button className="cancel-btn-modal" onClick={() => setShowPayment(false)}>Annuler</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
