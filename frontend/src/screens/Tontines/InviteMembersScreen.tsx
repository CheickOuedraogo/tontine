import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Clock, CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import './InviteMembersScreen.css';

import { useModal } from '../../context/ModalContext';

export const InviteMembersScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const currentUser = useAuthStore(state => state.user);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [tontine, setTontine] = useState<any>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await apiClient.get(`/tontines/${tontineId}`);
                const tontineData = res.data.tontine || res.data;
                setTontine(tontineData);
                
                if (tontineData.creatorId === currentUser?.id) {
                    loadInvitations();
                }
            } catch (err) {
                // Access check failed
            } finally {
                setCheckingAccess(false);
            }
        };
        checkAccess();
    }, [tontineId, currentUser?.id]);

    const loadInvitations = async () => {
        try {
            const res = await apiClient.get(`/invitations/tontine/${tontineId}`);
            setInvitations(res.data.invitations || []);
        } catch { }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Veuillez entrer un email.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await apiClient.post(`/invitations/tontine/${tontineId}`, {
                emailInvite: email.trim(),
            });
            showAlert('Succès', `Invitation envoyée à ${email.trim()} !`, 'success');
            setEmail('');
            loadInvitations();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig: Record<string, { color: string; bg: string; label: string; Icon: any }> = {
        EN_ATTENTE: { color: '#D97706', bg: '#FEF3C7', label: 'En attente', Icon: Clock },
        ACCEPTEE: { color: '#059669', bg: '#D1FAE5', label: 'Acceptée', Icon: CheckCircle },
        REFUSEE: { color: '#EF4444', bg: '#FEE2E2', label: 'Refusée', Icon: XCircle },
        EXPIREE: { color: '#6B7280', bg: '#F3F4F6', label: 'Expirée', Icon: Clock },
    };

    const isCreator = String(tontine?.creatorId) === String(currentUser?.id);

    if (checkingAccess) {
        return (
            <div className="loading-state">
                <div className="spinner large"></div>
                <p>Vérification de l'accès...</p>
            </div>
        );
    }

    if (!isCreator) {
        return (
            <div className="invite-page access-denied">
                <div className="error-state premium-card">
                    <AlertCircle color="#EF4444" size={48} />
                    <h2>Accès refusé</h2>
                    <p>Seul le créateur de la tontine peut inviter des membres.</p>
                    <Button title="Retour" onClick={() => navigate(-1)} />
                </div>
            </div>
        );
    }

    return (
        <div className="invite-page">
            <header className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Inviter des membres</h1>
                    <span className="status-pill">{tontine?.nom}</span>
                </div>
            </header>

            <div className="invite-grid">
                <section className="invite-form-section">
                    <div className="premium-card invite-card">
                        <h3>Inviter par email</h3>
                        <p className="card-desc">
                            L'utilisateur recevra une notification dans l'application et pourra accepter ou refuser.
                        </p>

                        {error && (
                            <div className="error-banner">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleInvite}>
                            <Input
                                label="Adresse email du membre"
                                placeholder="membre@email.com"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                icon={UserPlus}
                                required
                            />
                            <Button 
                                title="Envoyer l'invitation" 
                                type="submit"
                                isLoading={isLoading} 
                                className="invite-btn"
                            />
                        </form>
                    </div>
                </section>

                {invitations.length > 0 && (
                    <section className="invitation-list-section">
                        <div className="premium-card history-card">
                            <h3>Historique des invitations ({invitations.length})</h3>
                            <div className="invitations-list-web">
                                {invitations.map((inv: any, i: number) => {
                                    const cfg = statusConfig[inv.statut] || statusConfig.EN_ATTENTE;
                                    const StatusIcon = cfg.Icon;
                                    return (
                                        <div key={i} className="invited-row-web">
                                            <div className="status-icon-wrapper" style={{ backgroundColor: cfg.bg }}>
                                                <StatusIcon color={cfg.color} size={16} />
                                            </div>
                                            <div className="invited-info">
                                                <span className="invited-email">{inv.emailInvite}</span>
                                                {inv.nom && <span className="invited-name">{inv.prenom} {inv.nom}</span>}
                                            </div>
                                            <span className="status-badge-web" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default InviteMembersScreen;
