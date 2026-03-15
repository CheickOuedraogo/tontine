import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { 
    ArrowLeft, ArrowUp, ArrowDown, Trash2, 
    Play, Save, UserPlus, BarChart3, List, MessageSquare, Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useModal } from '../../context/ModalContext';
import './AdminTontineScreen.css';

export const AdminTontineScreen = () => {
    const { id: tontineId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const currentUser = useAuthStore(state => state.user);

    const [tontine, setTontine] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreator, setIsCreator] = useState(false);
    const [orderChanged, setOrderChanged] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const loadData = useCallback(async () => {
        if (!tontineId) return;
        setIsLoading(true);
        try {
            const resT = await apiClient.get(`/tontines/${tontineId}`);
            const tData = resT.data.tontine || resT.data;
            setTontine(tData);
            setIsCreator(String(tData.creatorId) === String(currentUser?.id));

            const resM = await apiClient.get(`/tontines/${tontineId}/membres`);
            const mData = resM.data.membres || resM.data.data || [];
            setMembers(Array.isArray(mData) ? mData : []);
        } catch (err) { }
        finally { setIsLoading(false); }
    }, [tontineId, currentUser?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStart = async () => {
        const confirmed = await showConfirm(
            'Démarrer la tontine',
            'Voulez-vous vraiment démarrer cette tontine ? Cette action est irréversible.'
        );
        if (!confirmed) return;

        try {
            await apiClient.post(`/tontines/${tontineId}/start`);
            showAlert('Succès', 'Tontine démarrée avec succès !', 'success');
            loadData();
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de démarrer.', 'error');
        }
    };

    const handleRemoveMember = async (userId: number) => {
        const confirmed = await showConfirm(
            'Retirer un membre',
            'Êtes-vous sûr de vouloir retirer ce membre ?'
        );
        if (!confirmed) return;

        try {
            await apiClient.delete(`/tontines/${tontineId}/membres/${userId}`);
            loadData();
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de retirer le membre.', 'error');
        }
    };

    const handleMoveMember = (index: number, direction: 'up' | 'down') => {
        const newMembers = [...members];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= members.length) return;

        const temp = newMembers[index];
        newMembers[index] = newMembers[targetIndex];
        newMembers[targetIndex] = temp;
        setMembers(newMembers);
        setOrderChanged(true);
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm(
            'Supprimer la tontine',
            'Voulez-vous vraiment supprimer cette tontine ? Cette action est irréversible.'
        );
        if (!confirmed) return;

        try {
            await apiClient.delete(`/tontines/${tontineId}`);
            showAlert('Succès', 'Tontine supprimée.', 'success');
            navigate('/');
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de supprimer.', 'error');
        }
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const ordre = members.map(m => m.userId);
            await apiClient.put(`/tontines/${tontineId}/membres/ordre`, { ordre });
            showAlert('Succès', 'Ordre de distribution mis à jour !', 'success');
            setOrderChanged(false);
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de sauvegarder l\'ordre.', 'error');
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner large"></div>
                <p>Chargement des paramètres...</p>
            </div>
        );
    }

    if (!isCreator) {
        return (
            <div className="admin-page">
                <div className="error-state premium-card">
                    <h2>Accès restreint</h2>
                    <p>Seul le créateur peut accéder à l'administration.</p>
                    <Button title="Retour" onClick={() => navigate(-1)} />
                </div>
            </div>
        );
    }

    const isEnAttente = tontine?.statut === 'EN_ATTENTE';
    const membersCount = members.length;

    return (
        <div className="admin-page">
            <header className="details-header admin-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <div className="title-with-icon-header">
                        <h1>Administration</h1>
                    </div>
                    <p className="tontine-context-name">{tontine?.nom}</p>
                </div>
            </header>

            <div className="admin-content-container">
                <section className="admin-card">
                    <div className="section-header">
                        <h3>Membres & Ordre ({membersCount})</h3>
                        {isEnAttente && orderChanged && (
                            <Button 
                                title="Sauvegarder" 
                                icon={Save} 
                                onClick={handleSaveOrder}
                                isLoading={isSavingOrder}
                            />
                        )}
                    </div>

                    <div className="members-list-admin">
                        {members.map((m, i) => (
                            <div key={m.userId} className="member-row-admin">
                                <span className="member-order-num">{i + 1}</span>
                                <div className="member-avatar-mini">
                                    {m.photo ? (
                                        <img src={m.photo.startsWith('http') ? m.photo : `http://localhost:3000${m.photo}`} alt="" />
                                    ) : (
                                        <span>{m.prenom[0]}</span>
                                    )}
                                </div>
                                <div className="member-info-admin">
                                    <span className="m-name">{m.prenom} {m.nom}</span>
                                    <span className="m-email">{m.email}</span>
                                </div>
                                
                                {isEnAttente && (
                                    <div className="member-management-tools">
                                        <button className="arrow-btn-admin" onClick={() => handleMoveMember(i, 'up')} disabled={i === 0}>
                                            <ArrowUp size={16} />
                                        </button>
                                        <button className="arrow-btn-admin" onClick={() => handleMoveMember(i, 'down')} disabled={i === members.length - 1}>
                                            <ArrowDown size={16} />
                                        </button>
                                        <button className="remove-m-btn" onClick={() => handleRemoveMember(m.userId)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-card">
                    <div className="section-header">
                        <h3>Actions Rapides</h3>
                    </div>
                    <div className="actions-grid-admin">
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/cotisations/stats`)}>
                            <BarChart3 size={18} />
                            <span>Statistiques de cotisations</span>
                        </button>
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/payments`)}>
                            <List size={18} />
                            <span>Journal des paiements</span>
                        </button>
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/distributions`)}>
                            <Shield size={18} />
                            <span>Plan de distribution</span>
                        </button>
                        <button className="admin-action-btn" onClick={() => navigate(`/tontines/${tontineId}/chat`)}>
                            <MessageSquare size={18} />
                            <span>Discussion de groupe</span>
                        </button>
                    </div>
                </section>

                <section className="admin-card critical-actions">
                    <div className="section-header">
                        <h3>Gestion de la Tontine</h3>
                    </div>

                    <div className="actions-grid-admin">
                        {isEnAttente && (
                            <div className="admin-action-btn-composite">
                                <div className="aca-text">
                                    <h3>Lancer la tontine</h3>
                                    <p>Génère les tours et les dates fixes.</p>
                                </div>
                                <Button title="Démarrer" icon={Play} onClick={handleStart} />
                            </div>
                        )}

                        {isEnAttente && membersCount < (tontine?.nbMembresAttendu || 0) && (
                            <div className="admin-action-btn-composite">
                                <div className="aca-text">
                                    <h3>Invitations</h3>
                                    <p>Gérer les nouveaux membres.</p>
                                </div>
                                <Button title="Inviter" icon={UserPlus} onClick={() => navigate(`/tontines/${tontineId}/invite`)} variant="secondary" />
                            </div>
                        )}

                        {isEnAttente && (
                            <div className="admin-action-btn-composite">
                                <div className="aca-text">
                                    <h3>Suppression</h3>
                                    <p>Supprimer définitivement la tontine.</p>
                                </div>
                                <Button title="Supprimer" icon={Trash2} variant="danger" onClick={handleDelete} />
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
