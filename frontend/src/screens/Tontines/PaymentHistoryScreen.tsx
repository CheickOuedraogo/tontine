import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import './PaymentHistoryScreen.css';

interface Payment {
    id: string;
    montant: number;
    statut: string;
    datePaiement: string;
    datePrevue: string;
    cycleNumero?: number;
    methode?: string;
    beneficiaireNom?: string;
    beneficiairePrenom?: string;
}

const STATUS_FR: Record<string, string> = {
    PAYEE: 'Payé',
    EN_ATTENTE: 'En attente',
    EN_RETARD: 'En retard',
    ANNULEE: 'Annulé',
};

export const PaymentHistoryScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, [tontineId]);

    const loadPayments = async () => {
        try {
            const res = await apiClient.get(`/cotisations/tontine/${tontineId}`);
            const data = res.data.cotisations || res.data.data || res.data;
            setPayments(Array.isArray(data) ? data : []);
        } catch {
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPaid = payments.filter(p => p.statut === 'PAYEE').reduce((s, p) => s + Number(p.montant), 0);
    const totalPending = payments.filter(p => p.statut !== 'PAYEE').reduce((s, p) => s + Number(p.montant), 0);

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return <CheckCircle size={16} />;
            case 'EN_RETARD': return <AlertCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="payment-history-page">
            <header className="details-header history-header">
                <button onClick={() => navigate(-1)} className="back-btn-details inverse">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Historique Paiements</h1>
                    <div className="header-stats-web">
                        <div className="stat-pill">
                            <TrendingUp size={16} color="#34D399" />
                            <span>{totalPaid.toLocaleString('fr-FR')} F Payés</span>
                        </div>
                        <div className="stat-pill">
                            <TrendingDown size={16} color="#FBBF24" />
                            <span>{totalPending.toLocaleString('fr-FR')} F En attente</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="payment-history-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement de l'historique...</p>
                    </div>
                ) : (
                    <div className="payments-list-web">
                        {payments.map((item) => (
                            <div key={item.id} className={`payment-row-web premium-card ${item.statut}`}>
                                <div className="payment-main-info">
                                    <div className="payment-amount-box">
                                        <span className="p-amount">{Number(item.montant).toLocaleString('fr-FR')} F</span>
                                        <div className={`p-status-badge ${item.statut}`}>
                                            {getStatusIcon(item.statut)}
                                            <span>{STATUS_FR[item.statut] || item.statut}</span>
                                        </div>
                                    </div>
                                    <div className="payment-secondary-info">
                                        <span className="p-date">
                                            {item.datePaiement
                                                ? new Date(item.datePaiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : `Prévu le ${new Date(item.datePrevue || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                                            }
                                        </span>
                                        {item.cycleNumero && (
                                            <span className="p-details">
                                                Tour {item.cycleNumero} {item.beneficiairePrenom ? `pour ${item.beneficiairePrenom} ${item.beneficiaireNom}` : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {payments.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <Wallet size={36} />
                                </div>
                                <h3>Aucun paiement</h3>
                                <p>L'historique apparaîtra ici une fois la tontine démarrée.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
