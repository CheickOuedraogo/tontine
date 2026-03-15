import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { SOCKET_URL } from '../../constants';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { tontineApi } from '../../api/tontine';
import { Settings, ArrowLeft, UserMinus, ChevronUp, ChevronDown, Save, UserPlus } from 'lucide-react';
import './AdminTontineScreen.css';

export const AdminTontineScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore(state => state.user);

    const [tontine, setTontine] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [orderChanged, setOrderChanged] = useState(false);

    useEffect(() => {
        loadData();
    }, [tontineId]);

    const loadData = async () => {
        try {
            const [tRes, mRes] = await Promise.all([
                apiClient.get(`/tontines/${tontineId}`),
                apiClient.get(`/tontines/${tontineId}/membres`).catch(() => ({ data: { membres: [] } })),
            ]);
            setTontine(tRes.data.tontine || tRes.data);
            const loadedMembers = mRes.data.membres || mRes.data.data || [];
            loadedMembers.sort((a: any, b: any) => (a.ordreDistribution || 0) - (b.ordreDistribution || 0));
            setMembers(loadedMembers);
        } catch (err) {
            // Error handling
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async () => {
        if (!window.confirm('Voulez-vous vraiment démarrer cette tontine ? Cette action est irréversible.')) return;
        try {
            await apiClient.post(`/tontines/${tontineId}/start`, {});
            loadData();
            alert('Tontine démarrée avec succès !');
        } catch (err: any) {
            alert('Erreur: ' + (err.response?.data?.message || 'Impossible de démarrer.'));
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;
        try {
            await tontineApi.removeMember(tontineId!, userId);
            loadData();
        } catch (err: any) {
            alert('Erreur: ' + (err.response?.data?.message || 'Impossible de retirer le membre.'));
        }
    };

    const moveMember = (index: number, direction: 'up' | 'down') => {
        const newMembers = [...members];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newMembers.length) return;
        
        [newMembers[index], newMembers[targetIndex]] = [newMembers[targetIndex], newMembers[index]];
        setMembers(newMembers);
        setOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const ordre = members.map((m, i) => ({
                userId: m.userId,
                ordre: i + 1,
            }));
            await tontineApi.updateMembresOrdre(tontineId!, ordre);
            setOrderChanged(false);
            alert('Ordre de distribution mis à jour !');
        } catch (err: any) {
            alert('Erreur: ' + (err.response?.data?.message || 'Impossible de sauvegarder l\'ordre.'));
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state full-page">
                <div className="spinner large"></div>
                <p>Chargement de l'administration...</p>
            </div>
        );
    }

    const membersCount = Array.isArray(members) ? members.length : 0;
    const membersReady = membersCount >= (tontine?.nbMembresAttendu || 0);
    const isCreator = String(currentUser?.id) === String(tontine?.creatorId);
    const isEnAttente = tontine?.statut === 'EN_ATTENTE';

    return (
        <div className="admin-page">
            <header className="details-header admin-header">
                <button onClick={() => navigate(-1)} className="back-btn-details inverse">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <div className="title-with-icon-header">
                        <Settings size={20} color="white" />
                        <h1>Administration</h1>
                    </div>
                    <p className="tontine-context-name">{tontine?.nom}</p>
                </div>
            </header>

            <div className="admin-content-container">
                <section className="admin-card status-section premium-card">
                    <div className="section-header">
                        <h3>Statut de la Tontine</h3>
                        <span className={`status-pill-large ${tontine?.statut}`}>
                            {tontine?.statut}
                        </span>
                    </div>

                    {isEnAttente && isCreator && (
                        <div className="admin-actions-start">
                            <Button
                                title="Démarrer la Tontine"
                                onClick={handleStart}
                                disabled={!membersReady}
                                className="start-btn-large"
                            />
                            {!membersReady && (
                                <p className="members-needed-hint">
                                    En attente de membres ({membersCount} / {tontine?.nbMembresAttendu}).
                                </p>
                            )}
                        </div>
                    )}
                </section>

                <section className="admin-card members-section premium-card">
                    <div className="section-header">
                        <h3>Membres ({membersCount} / {tontine?.nbMembresAttendu})</h3>
                        {isCreator && (
                            <button 
                                className="invite-btn-mini"
                                onClick={() => navigate(`/tontines/${tontineId}/invite`)}
                            >
                                <UserPlus size={16} />
                                <span>Inviter</span>
                            </button>
                        )}
                    </div>

                    {isCreator && isEnAttente && (
                        <div className="order-hint-banner">
                            <p>Tirez les membres pour définir l'ordre de distribution</p>
                        </div>
                    )}

                    <div className="members-list-admin">
                        {members.map((m: any, i: number) => (
                            <div key={m.userId || i} className="member-row-admin">
                                <div className="member-order-num">{i + 1}</div>
                                <div className="member-avatar-mini">
                                    {m.photo ? (
                                        <img src={m.photo.startsWith('http') ? m.photo : `${SOCKET_URL}${m.photo}`} alt="M" />
                                    ) : (
                                        <span>{(m.prenom?.[0] || 'M').toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="member-info-admin">
                                    <span className="m-name">{m.prenom} {m.nom}</span>
                                    <span className="m-email">{m.email}</span>
                                </div>

                                {isCreator && isEnAttente && (
                                    <div className="member-management-tools">
                                        <div className="reorder-arrows">
                                            <button 
                                                className="arrow-btn-admin" 
                                                onClick={() => moveMember(i, 'up')}
                                                disabled={i === 0}
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button 
                                                className="arrow-btn-admin" 
                                                onClick={() => moveMember(i, 'down')}
                                                disabled={i === members.length - 1}
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                        {m.userId !== tontine?.creatorId && (
                                            <button 
                                                className="remove-m-btn" 
                                                onClick={() => handleRemoveMember(m.userId)}
                                            >
                                                <UserMinus size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isCreator && isEnAttente && orderChanged && (
                        <div className="save-order-container">
                            <Button 
                                title="Enregistrer l'ordre" 
                                onClick={handleSaveOrder} 
                                isLoading={isSavingOrder}
                                icon={Save}
                            />
                        </div>
                    )}
                </section>

                <section className="admin-card quick-actions-section premium-card">
                    <h3>Actions Rapides</h3>
                    <div className="actions-grid-admin">
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/cotisations/stats`)}>
                            Statistiques Cotisations
                        </button>
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/distributions`)}>
                            Plan de Distribution
                        </button>
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/chat`)}>
                            Accéder au Chat
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
