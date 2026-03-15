import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTontineStore } from '../../store/useTontineStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { TontineCard } from '../../components/ui/TontineCard';
import { Button } from '../../components/ui/Button';
import './DashboardScreen.css';

export const DashboardScreen = () => {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const { tontines, invitations, isLoading, fetchMyTontines, fetchInvitations, respondToInvitation, error } = useTontineStore();
    const { fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        fetchMyTontines();
        fetchInvitations();
        fetchUnreadCount();
    }, []);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Bonjour, {user?.prenom}</h1>
                    <p>Bienvenue sur votre tableau de bord TontineFit</p>
                </div>
                <Button 
                    title="Créer une Tontine" 
                    icon={Plus as any} 
                    onClick={() => navigate('/tontines/create')}
                    className="create-btn-top"
                />
            </header>

            {/* Invitations Section */}
            {invitations && invitations.length > 0 && (
                <section className="invitations-section">
                    <h2>Invitations reçues ({invitations.length})</h2>
                    <div className="invitations-grid">
                        {invitations.map(inv => (
                            <div key={inv.id} className="premium-card invitation-card">
                                <div className="inv-top">
                                    <h3>{inv.tontineNom}</h3>
                                    <span className="inv-badge">Nouveau</span>
                                </div>
                                <p className="inv-creator">Par {inv.creatorPrenom} {inv.creatorNom}</p>
                                <p className="inv-amount">
                                    <span>{Number(inv.montantCotisation).toLocaleString('fr-FR')} F</span> • {inv.intervalleJours}j
                                </p>
                                <div className="inv-actions">
                                    <button 
                                        className="inv-btn acc-btn" 
                                        onClick={() => respondToInvitation(inv.id, 'accepter')}
                                    >
                                        Accepter
                                    </button>
                                    <button 
                                        className="inv-btn ref-btn"
                                        onClick={() => respondToInvitation(inv.id, 'refuser')}
                                    >
                                        Refuser
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="tontines-section">
                <div className="section-header">
                    <h2>Mes Tontines</h2>
                </div>

                {error ? (
                    <div className="error-state premium-card">
                        <AlertCircle size={48} className="error-icon" />
                        <p>{error}</p>
                        <Button title="Réessayer" onClick={fetchMyTontines} variant="outline" />
                    </div>
                ) : isLoading && tontines.length === 0 ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement de vos tontines...</p>
                    </div>
                ) : tontines.length > 0 ? (
                    <div className="tontines-list">
                        {tontines.map((item) => (
                            <TontineCard
                                key={item.id}
                                nom={item.nom}
                                montantCotisation={Number(item.montantCotisation)}
                                intervalleJours={(item as any).intervalleJours}
                                statut={item.statut}
                                onClick={() => navigate(`/tontines/${item.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state premium-card">
                        <div className="empty-icon-circle">
                            <Wallet size={36} />
                        </div>
                        <h3>Aucune tontine</h3>
                        <p>
                            Créez votre première tontine et invitez vos proches à participer.
                        </p>
                        <Button
                            title="Créer une Tontine"
                            onClick={() => navigate('/tontines/create')}
                        />
                    </div>
                )}
            </section>
        </div>
    );
};
