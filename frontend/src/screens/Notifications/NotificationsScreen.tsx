import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { apiClient } from '../../api/client';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Wallet, UserPlus, ArrowLeft } from 'lucide-react';
import './NotificationsScreen.css';

const ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
    PAIEMENT_RECU: { icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
    RETARD_PAIEMENT: { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
    RAPPEL_PAIEMENT: { icon: Clock, color: '#D97706', bg: '#FEF3C7' },
    TONTINE_DEMARREE: { icon: Wallet, color: '#6366F1', bg: '#EEF2FF' },
    INVITATION_TONTINE: { icon: UserPlus, color: '#6366F1', bg: '#EEF2FF' },
    INVITATION_ACCEPTEE: { icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
    INVITATION_REFUSEE: { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
    DISTRIBUTION_PRETE: { icon: Wallet, color: '#059669', bg: '#D1FAE5' },
    DEFAULT: { icon: Info, color: '#6366F1', bg: '#EEF2FF' },
};

export const NotificationsScreen = () => {
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            showAlert('Erreur', 'Impossible de charger les notifications.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await apiClient.post(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, estLue: true } : n));
        } catch (err) {
            showAlert('Erreur', 'Impossible de marquer la notification comme lue.', 'error');
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleInvitationAction = async (notif: any, action: 'accepter' | 'refuser') => {
        // Extract invitation ID from lienAction: "/invitations/{id}/repondre"
        const match = notif.lienAction?.match(/\/invitations\/([^/]+)/);
        if (!match) {
            showAlert('Erreur', 'Impossible de traiter cette invitation.', 'error');
            return;
        }
        const invitationId = match[1];
        setActionLoading(notif.id);
        try {
            await apiClient.post(`/invitations/${invitationId}/${action}`);
            await markAsRead(notif.id);
            showAlert('Succès', action === 'accepter' ? 'Vous avez rejoint la tontine !' : 'Invitation refusée.', 'success');
            loadNotifications();
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Une erreur est survenue.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="notifications-page">
            <header className="details-header notifications-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Alertes & Notifications</h1>
                    <span className="status-pill">
                        {notifications.filter((n: any) => !n.estLue).length} non lue(s)
                    </span>
                </div>
            </header>

            <div className="notifications-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Chargement des notifications...</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map((item: any) => {
                            const config = ICON_MAP[item.type] || ICON_MAP.DEFAULT;
                            const IconComponent = config.icon;
                            const isInvitation = item.type === 'INVITATION_TONTINE' && !item.estLue;

                            return (
                                <div
                                    key={item.id}
                                    className={`notification-card premium-card ${!item.estLue ? 'unread' : ''}`}
                                    onClick={() => !isInvitation && !item.estLue && markAsRead(item.id)}
                                >
                                    <div className="notif-icon-circle" style={{ backgroundColor: config.bg }}>
                                        <IconComponent color={config.color} size={20} />
                                    </div>
                                    <div className="notif-content">
                                        <h3 className={!item.estLue ? 'unread-title' : ''}>{item.titre}</h3>
                                        <p className="notif-message">{item.contenu}</p>
                                        <span className="notif-date">
                                            {new Date(item.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {new Date(item.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        
                                        {isInvitation && (
                                            <div className="notif-actions">
                                                <button 
                                                    className="notif-btn accept-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleInvitationAction(item, 'accepter'); }}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    <CheckCircle size={16} />
                                                    Accepter
                                                </button>
                                                <button 
                                                    className="notif-btn refuse-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleInvitationAction(item, 'refuser'); }}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!item.estLue && !isInvitation && <div className="unread-dot-notif" />}
                                </div>
                            );
                        })}

                        {notifications.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <Bell size={36} />
                                </div>
                                <h3>Aucune alerte</h3>
                                <p>Vos notifications apparaîtront ici.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
