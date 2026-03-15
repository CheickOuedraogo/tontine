import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useNotificationStore } from '../../store/useNotificationStore';
import { apiClient } from '../../api/client';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Wallet, UserPlus, ArrowLeft, Trash2, Trash } from 'lucide-react';
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
    const { showAlert, showConfirm } = useModal();
    const { notifications, isLoading, fetchNotifications, markAsRead, deleteNotification, clearAllNotifications } = useNotificationStore();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleInvitationAction = async (notif: any, action: 'accepter' | 'refuser') => {
        const match = notif.lienAction?.match(/\/invitations\/([^/]+)/);
        if (!match) {
            showAlert('Erreur', 'Impossible de traiter cette invitation.');
            return;
        }
        const invitationId = match[1];
        setActionLoading(notif.id);
        try {
            await apiClient.post(`/invitations/${invitationId}/${action}`);
            await markAsRead(notif.id);
            showAlert('Succès', action === 'accepter' ? 'Vous avez rejoint la tontine !' : 'Invitation refusée.');
            fetchNotifications();
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearAll = () => {
        showConfirm(
            'Tout effacer ?',
            'Voulez-vous vraiment supprimer toutes vos notifications ? Cette action est irréversible.',
            async () => {
                await clearAllNotifications();
            }
        );
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteNotification(id);
    };

    const unreadCount = notifications.filter((n: any) => !(n.lu || n.estLue)).length;

    return (
        <div className="notifications-page">
            <header className="details-header notifications-header">
                <div className="header-left-group">
                    <button onClick={() => navigate(-1)} className="back-btn-details">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-titles">
                        <h1>Alertes & Notifications</h1>
                        {notifications.length > 0 && (
                            <span className="status-pill">
                                {unreadCount} non lue(s)
                            </span>
                        )}
                    </div>
                </div>
                
                {notifications.length > 0 && (
                    <button className="clear-all-btn" onClick={handleClearAll}>
                        <Trash2 size={16} />
                        <span>Tout effacer</span>
                    </button>
                )}
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
                            const isLue = item.lu || item.estLue;
                            const isInvitation = item.type === 'INVITATION_TONTINE' && !isLue;

                            return (
                                <div
                                    key={item.id}
                                    className={`notification-card premium-card ${!isLue ? 'unread' : ''}`}
                                    onClick={() => !isInvitation && !isLue && markAsRead(item.id)}
                                >
                                    <div className="notif-icon-circle" style={{ backgroundColor: config.bg }}>
                                        <IconComponent color={config.color} size={20} />
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-header-row">
                                            <h3 className={!isLue ? 'unread-title' : ''}>{item.titre}</h3>
                                            <button 
                                                className="delete-notif-btn" 
                                                onClick={(e) => handleDelete(e, item.id)}
                                                title="Supprimer"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                        <p className="notif-message">{item.contenu || item.message}</p>
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
                                    {!isLue && !isInvitation && <div className="unread-dot-notif" />}
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
