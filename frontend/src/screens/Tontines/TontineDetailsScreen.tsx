import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tontineApi } from '../../api/tontine';
import { useTontineStore } from '../../store/useTontineStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import {
    Wallet, Users, MessageCircle, Settings, Clock,
    ArrowLeft, CreditCard, BarChart3, UserPlus, Trash2, Play, ChevronRight
} from 'lucide-react';
import './TontineDetailsScreen.css';

export const TontineDetailsScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const { currentTontine, isLoading, fetchTontineDetails, deleteTontine } = useTontineStore();
    const [membresCount, setMembresCount] = useState(0);

    const loadData = useCallback(() => {
        if (!id) return;
        fetchTontineDetails(id);
        apiClient.get(`/tontines/${id}/membres`).then(res => {
            const m = res.data.membres || res.data.data || [];
            setMembresCount(Array.isArray(m) ? m.length : 0);
        }).catch(() => { });
    }, [id, fetchTontineDetails]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async () => {
        if (window.confirm('Voulez-vous vraiment supprimer cette tontine ? Cette action est irréversible.')) {
            const success = await deleteTontine(id!);
            if (success) {
                navigate('/');
            }
        }
    };

    const handleStart = async () => {
        if (membresCount < 2) {
            alert('Impossible: Il faut au moins 2 membres pour commencer.');
            return;
        }

        if (window.confirm('Voulez-vous commencer la tontine maintenant ?')) {
            try {
                await tontineApi.startTontine(id!);
                alert('Success: La tontine a commencé !');
                loadData();
            } catch (err: any) {
                alert('Erreur: ' + (err.response?.data?.message || 'Impossible de commencer.'));
            }
        }
    };

    if (isLoading || !currentTontine) {
        return (
            <div className="loading-state">
                <div className="spinner large"></div>
                <p>Chargement des détails...</p>
            </div>
        );
    }

    const isCreator = String(currentTontine.creatorId) === String(user?.id);

    return (
        <div className="tontine-details-page">
            <header className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>{currentTontine.nom}</h1>
                    <span className={`status-pill ${currentTontine.statut.toLowerCase()}`}>
                        {currentTontine.statut}
                    </span>
                </div>
            </header>

            <div className="details-grid">
                {/* Stats Section */}
                <div className="stats-container">
                    <div className="premium-card stat-item">
                        <Wallet className="stat-icon wallet" size={24} />
                        <div className="stat-info">
                            <span className="stat-label">Cotisation</span>
                            <span className="stat-value">{Number(currentTontine.montantCotisation).toLocaleString('fr-FR')} F</span>
                        </div>
                    </div>
                    <div className="premium-card stat-item">
                        <Clock className="stat-icon interval" size={24} />
                        <div className="stat-info">
                            <span className="stat-label">Intervalle</span>
                            <span className="stat-value">Tous les {(currentTontine as any).intervalleJours || '?'} jours</span>
                        </div>
                    </div>
                    <div className="premium-card stat-item">
                        <Users className="stat-icon members" size={24} />
                        <div className="stat-info">
                            <span className="stat-label">Membres</span>
                            <span className="stat-value">{membresCount}/{currentTontine.nbMembresAttendu}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="actions-section">
                    <h2>Actions & Gestion</h2>
                    <div className="actions-grid">
                        <ActionCard
                            icon={<CreditCard color="#6366F1" size={24} />}
                            title="Cotisations"
                            subtitle="Payer mes cotisations"
                            onClick={() => navigate(`/tontines/${id}/cotisations`)}
                        />
                        <ActionCard
                            icon={<BarChart3 color="#059669" size={24} />}
                            title="Historique"
                            subtitle="Paiements effectués"
                            onClick={() => navigate(`/tontines/${id}/payments`)}
                        />
                        <ActionCard
                            icon={<Wallet color="#D97706" size={24} />}
                            title="Distributions"
                            subtitle="Cagnottes versées"
                            onClick={() => navigate(`/tontines/${id}/distributions`)}
                        />
                        <ActionCard
                            icon={<MessageCircle color="#F59E0B" size={24} />}
                            title="Chat"
                            subtitle="Discussion du groupe"
                            onClick={() => navigate(`/tontines/${id}/chat`)}
                        />
                        {isCreator && currentTontine.statut === 'EN_ATTENTE' && membresCount < currentTontine.nbMembresAttendu && (
                            <ActionCard
                                icon={<UserPlus color="#6366F1" size={24} />}
                                title="Inviter"
                                subtitle="Ajouter des membres"
                                onClick={() => navigate(`/tontines/${id}/invite`)}
                            />
                        )}
                        {isCreator && (
                            <ActionCard
                                icon={<Settings color="#64748B" size={24} />}
                                title="Admin"
                                subtitle="Gérer la tontine"
                                onClick={() => navigate(`/tontines/${id}/admin`)}
                            />
                        )}
                        {isCreator && currentTontine.statut === 'EN_ATTENTE' && (
                            <ActionCard
                                icon={<Trash2 color="#EF4444" size={24} />}
                                title="Supprimer"
                                subtitle="Annuler la tontine"
                                onClick={handleDelete}
                                variant="danger"
                            />
                        )}
                        {isCreator && currentTontine.statut === 'EN_ATTENTE' && (
                            <ActionCard
                                icon={<Play color="#6366F1" size={24} />}
                                title="Commencer"
                                subtitle="Démarrer la tontine"
                                onClick={handleStart}
                                variant="primary"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ icon, title, subtitle, onClick, variant }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void; variant?: string }) => (
    <button className={`action-card premium-card ${variant || ''}`} onClick={onClick}>
        <div className="action-icon-wrapper">{icon}</div>
        <div className="action-text">
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
        <ChevronRight size={18} className="action-chevron" />
    </button>
);
