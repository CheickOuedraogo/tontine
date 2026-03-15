import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { apiClient } from '../../api/client';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Wallet, UserPlus } from 'lucide-react';
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
    const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleInvitationAction = async (notif: any, action: 'accepter' | 'refuser') => {
        // Extract invitation ID from lienAction: "/invitations/{id}/repondre"
        const match = notif.lienAction?.match(/\/invitations\/([^/]+)/);
        if (!match) {
            alert('Erreur: Impossible de traiter cette invitation.');
            return;
        }
        const invitationId = match[1];
        setActionLoading(notif.id);
        try {
            await apiClient.post(`/invitations/${invitationId}/${action}`);
            await markAsRead(notif.id);
            alert(action === 'accepter' ? 'Vous avez rejoint la tontine !' : 'Invitation refusée.');
            fetchNotifications();
        } catch (err: any) {
            alert('Erreur: ' + (err.response?.data?.message || 'Une erreur est survenue.'));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="notifications-page">
            <header className="details-header">
                <div className="header-icon-circle">
                    <Bell size={20} color="white" />
                </div>
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
