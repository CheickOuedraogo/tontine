import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import {
    CheckCircle2, Clock, AlertCircle, BarChart3, ArrowLeft, Users
} from 'lucide-react';
import './StatistiquesCotisationsScreen.css';

export const StatistiquesCotisationsScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [cotisations, setCotisations] = useState<any[]>([]);
    const [tontine, setTontine] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cycleNumero, setCycleNumero] = useState<number | null>(null);

    useEffect(() => {
        apiClient.get(`/tontines/${tontineId}`).then(res => {
            setTontine(res.data.tontine || res.data);
        }).catch(() => {});
    }, [tontineId]);

    useEffect(() => {
        const loadStatistiques = async () => {
            setIsLoading(true);
            try {
                const url = cycleNumero 
                    ? `/cotisations/tontine/${tontineId}?stats=true&cycleNumero=${cycleNumero}`
                    : `/cotisations/tontine/${tontineId}?stats=true`;
                const res = await apiClient.get(url);
                setCotisations(res.data.cotisations || []);
            } catch (err) {
                // Error loading stats
            } finally {
                setIsLoading(false);
            }
        };
        loadStatistiques();
    }, [tontineId, cycleNumero]);

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return <CheckCircle2 color="#059669" size={18} />;
            case 'EN_RETARD': return <AlertCircle color="#DC2626" size={18} />;
            default: return <Clock color="#D97706" size={18} />;
        }
    };

    const getStatusInfo = (statut: string) => {
        switch (statut) {
            case 'PAYEE': return { label: 'Payée', bg: '#D1FAE5', color: '#059669' };
            case 'EN_RETARD': return { label: 'En retard', bg: '#FEE2E2', color: '#DC2626' };
            default: return { label: 'En attente', bg: '#FEF3C7', color: '#D97706' };
        }
    };

    const cycles = tontine?.dureeTotale 
        ? Array.from({ length: tontine.dureeTotale }, (_, i) => i + 1)
        : [...new Set(cotisations.map(c => c.cycleNumero))].sort((a, b) => a - b);
    
    const totalPaid = cotisations.filter(c => c.statut === 'PAYEE').length;
    const totalPending = cotisations.filter(c => c.statut !== 'PAYEE').length;
    const totalAmount = cotisations.filter(c => c.statut === 'PAYEE').reduce((s, c) => s + Number(c.montant), 0);

    return (
        <div className="stats-cotisations-page">
            <header className="details-header stats-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Statistiques Cotisations</h1>
                    <div className="header-stats-web">
                        <div className="stat-pill">
                            <CheckCircle2 size={16} color="#34D399" />
                            <span>{totalPaid} Payées</span>
                        </div>
                        <div className="stat-pill">
                            <Clock size={16} color="#FBBF24" />
                            <span>{totalPending} En attente</span>
                        </div>
                        <div className="stat-pill">
                            <Users size={16} color="#A78BFA" />
                            <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="filters-row-web">
                <button 
                    className={`filter-btn-web ${cycleNumero === null ? 'active' : ''}`}
                    onClick={() => setCycleNumero(null)}
                >
                    Tous les tours
                </button>
                {cycles.map(cycle => (
                    <button 
                        key={cycle}
                        className={`filter-btn-web ${cycleNumero === cycle ? 'active' : ''}`}
                        onClick={() => setCycleNumero(cycle)}
                    >
                        Tour {cycle}
                    </button>
                ))}
            </div>

            <div className="stats-content-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement des statistiques...</p>
                    </div>
                ) : (
                    <div className="stats-list-web">
                        {cotisations.map((item: any) => {
                            const statusInfo = getStatusInfo(item.statut);
                            const isPayee = item.statut === 'PAYEE';

                            return (
                                <div key={item.id} className="stats-row-web premium-card">
                                    <div className="member-info-stats">
                                        <div className="avatar-stats">
                                            {item.membre?.photo ? (
                                                <img 
                                                    src={item.membre.photo.startsWith('http') ? item.membre.photo : `http://localhost:3000${item.membre.photo}`} 
                                                    alt="Avatar"
                                                />
                                            ) : (
                                                <span>{item.membre?.prenom?.[0]?.toUpperCase() || 'M'}</span>
                                            )}
                                        </div>
                                        <div className="member-text-stats">
                                            <span className="m-name">{item.membre ? `${item.membre.prenom} ${item.membre.nom}` : 'Membre'}</span>
                                            <span className="m-email">{item.membre?.email || ''}</span>
                                        </div>
                                    </div>

                                    <div className="cotisation-details-stats">
                                        <span className="m-amount">{Number(item.montant).toLocaleString('fr-FR')} F</span>
                                        <div className="m-status" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                            {getStatusIcon(item.statut)}
                                            <span>{statusInfo.label}</span>
                                        </div>
                                        {isPayee && item.datePaiement && (
                                            <span className="m-date">
                                                {new Date(item.datePaiement).toLocaleDateString('fr-FR', { 
                                                    day: 'numeric', 
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                        {item.operateur && (
                                            <span className="m-op">{item.operateur.replace('_', ' ')}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {cotisations.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <BarChart3 size={36} />
                                </div>
                                <h3>Aucune donnée</h3>
                                <p>Les cotisations seront générées une fois la tontine démarrée.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
