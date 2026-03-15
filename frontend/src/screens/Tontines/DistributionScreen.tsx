import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ArrowLeft, Award, Calendar, TrendingUp, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react';
import './DistributionScreen.css';

interface Distribution {
    id: string;
    beneficiaireId: string;
    montantBrut: number;
    montantFrais: number;
    montantNet: number;
    datePrevue: string;
    dateEffective: string | null;
    cycleNumero: number;
    statut: string;
    nom: string;
    prenom: string;
}

const STATUS_FR: Record<string, string> = {
    PLANIFIEE: 'En attente',
    EFFECTUEE: 'Effectuée',
    ANNULEE: 'Annulée',
};

export const DistributionScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDistributions();
    }, [tontineId]);

    const loadDistributions = async () => {
        try {
            const res = await apiClient.get(`/distributions/tontine/${tontineId}`);
            const data = res.data.distributions || res.data.data || res.data;
            setDistributions(Array.isArray(data) ? data : []);
        } catch {
            setDistributions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const totalDistributed = distributions
        .filter(d => d.statut === 'EFFECTUEE')
        .reduce((s, d) => s + Number(d.montantNet), 0);

    const nextDistribution = distributions.find(d => d.statut === 'PLANIFIEE');

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'EFFECTUEE': return <CheckCircle2 size={16} />;
            case 'ANNULEE': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="distribution-page">
            <header className="details-header distribution-header">
                <button onClick={() => navigate(-1)} className="back-btn-details inverse">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Plan de Distribution</h1>
                    <div className="header-stats-web">
                        <div className="stat-pill">
                            <TrendingUp size={16} color="#34D399" />
                            <span>{totalDistributed.toLocaleString('fr-FR')} F Distribués</span>
                        </div>
                        <div className="stat-pill">
                            <Calendar size={16} color="#FBBF24" />
                            <span>{distributions.length} Tours</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="distribution-content-container">
                {nextDistribution && (
                    <div className="next-beneficiary-card premium-card">
                        <div className="next-badge">PROCHAIN TOURNANT</div>
                        <div className="next-main-info">
                            <div className="next-icon-wrapper">
                                <Award size={24} />
                            </div>
                            <div className="next-text">
                                <h3>{nextDistribution.prenom} {nextDistribution.nom}</h3>
                                <p>Tour {nextDistribution.cycleNumero} • {new Date(nextDistribution.datePrevue).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="next-amount">
                                {Number(nextDistribution.montantNet).toLocaleString('fr-FR')} F
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement du plan de distribution...</p>
                    </div>
                ) : (
                    <div className="distributions-list-web">
                        {distributions.map((item) => (
                            <div key={item.id} className={`distribution-row-web premium-card ${item.statut}`}>
                                <div className="dist-tour-num">
                                    <span>#{item.cycleNumero}</span>
                                </div>
                                <div className="dist-benef-info">
                                    <span className="m-name">{item.prenom} {item.nom}</span>
                                    <span className="m-date">
                                        {new Date(item.datePrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="dist-amount-status">
                                    <span className="m-amount">{Number(item.montantNet).toLocaleString('fr-FR')} F</span>
                                    <div className={`m-status-pill ${item.statut}`}>
                                        {getStatusIcon(item.statut)}
                                        <span>{STATUS_FR[item.statut] || item.statut}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {distributions.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <Wallet size={36} />
                                </div>
                                <h3>Aucune distribution</h3>
                                <p>Le plan sera généré dès le démarrage de la tontine.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
