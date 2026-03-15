import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import {
    Users, Wallet, Calendar, Shield, CreditCard, 
    Trash2, Play, UserPlus,
    ArrowLeft, ArrowUp, ArrowDown, Save, BarChart3, MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useModal } from '../../context/ModalContext';
import './TontineDetailsScreen.css';

const ActionCard = ({ icon, title, subtitle, onClick }: any) => (
    <button className="action-card premium-card" onClick={onClick}>
        <div className="action-icon-wrapper">
            {icon}
        </div>
        <div className="action-text">
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
        <Shield size={16} className="action-chevron" />
    </button>
);

export const TontineDetailsScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const currentUser = useAuthStore(state => state.user);

    const [tontine, setTontine] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [membresCount, setMembresCount] = useState(0);
    const [isCreator, setIsCreator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [orderChanged, setOrderChanged] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const loadTontine = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const res = await apiClient.get(`/tontines/${id}`);
            const data = res.data.tontine || res.data;
            setTontine(data);
            setIsCreator(String(data.creatorId) === String(currentUser?.id));
            
            const resM = await apiClient.get(`/tontines/${id}/membres`);
            const m = resM.data.membres || resM.data.data || [];
            
            // Si la tontine est active, on récupère les distributions pour afficher le statut
            if (data.statut !== 'EN_ATTENTE') {
                try {
                    const resD = await apiClient.get(`/distributions/tontine/${id}`);
                    const dists = resD.data.distributions || resD.data.data || resD.data || [];
                    
                    // On mappe les distributions aux membres
                    const membersWithDist = (Array.isArray(m) ? m : []).map(member => {
                        const dist = dists.find((d: any) => String(d.beneficiaireId) === String(member.userId));
                        return { ...member, distribution: dist };
                    });
                    setMembers(membersWithDist);
                } catch (err) {
                    setMembers(Array.isArray(m) ? m : []);
                }
            } else {
                setMembers(Array.isArray(m) ? m : []);
            }
            
            setMembresCount(Array.isArray(m) ? m.length : 0);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id, currentUser?.id]);

    useEffect(() => {
        loadTontine();
    }, [loadTontine]);

    const handleRemoveMember = async (userId: number) => {
        const confirmed = await showConfirm(
            'Retirer un membre',
            'Êtes-vous sûr de vouloir retirer ce membre ?'
        );
        if (!confirmed) return;

        try {
            await apiClient.delete(`/tontines/${id}/membres/${userId}`);
            loadTontine();
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

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const ordre = members.map(m => m.userId);
            await apiClient.put(`/tontines/${id}/membres/ordre`, { ordre });
            showAlert('Succès', 'Ordre de distribution mis à jour !', 'success');
            setOrderChanged(false);
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de sauvegarder l\'ordre.', 'error');
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm(
            'Suppression', 
            'Voulez-vous vraiment supprimer cette tontine ? Cette action est irréversible.'
        );
        
        if (confirmed) {
            try {
                await apiClient.delete(`/tontines/${id}`);
                navigate('/');
            } catch (err) {
                showAlert('Erreur', 'Impossible de supprimer la tontine.', 'error');
            }
        }
    };

    const handleStart = async () => {
        if (membresCount < 2) {
            showAlert('Action impossible', 'Il faut au moins 2 membres pour commencer.', 'error');
            return;
        }

        const confirmed = await showConfirm(
            'Démarrage', 
            'Voulez-vous commencer la tontine maintenant ?'
        );
        
        if (confirmed) {
            try {
                await apiClient.post(`/tontines/${id}/start`);
                showAlert('Succès', 'La tontine a commencé !', 'success');
                loadTontine();
            } catch (err: any) {
                showAlert('Erreur', err.response?.data?.message || 'Impossible de commencer.', 'error');
            }
        }
    };

    if (isLoading || !tontine) {
        return (
            <div className="loading-state">
                <div className="spinner large"></div>
                <p>Chargement des détails...</p>
            </div>
        );
    }

    return (
        <div className="tontine-details-page">
            <header className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn-details">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-titles">
                    <h1>Détails de la Tontine</h1>
                    <span className={`status-pill ${tontine.statut === 'ACTIVE' ? 'active' : ''}`}>
                        {tontine.statut}
                    </span>
                </div>
            </header>

            <div className="details-grid">
                <section className="stats-container">
                    <div className="stat-item premium-card">
                        <div className="stat-icon wallet">
                            <Wallet size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Montant</span>
                            <span className="stat-value">{Number(tontine.montantCotisation).toLocaleString()} F</span>
                        </div>
                    </div>

                    <div className="stat-item premium-card">
                        <div className="stat-icon interval">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Fréquence</span>
                            <span className="stat-value">{tontine.frequence}</span>
                        </div>
                    </div>

                    <div className="stat-item premium-card">
                        <div className="stat-icon members">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Membres</span>
                            <span className="stat-value">{membresCount} / {tontine.nbMembresAttendu}</span>
                        </div>
                    </div>
                </section>

                <section className="actions-section">
                    <h2>Actions Rapides</h2>
                    <div className="actions-grid">
                        <ActionCard
                            icon={<CreditCard color="#10B981" size={24} />}
                            title="Cotisations"
                            subtitle="Mes paiements"
                            onClick={() => navigate(`/tontines/${id}/cotisations`)}
                        />
                         <ActionCard
                            icon={<MessageSquare color="#6366F1" size={24} />}
                            title="Discussion"
                            subtitle="Discussion du groupe"
                            onClick={() => navigate(`/tontines/${id}/chat`)}
                        />
                        {isCreator && (
                            <ActionCard
                                icon={<BarChart3 color="#F59E0B" size={24} />}
                                title="Statistiques"
                                subtitle="Suivi des cotisations"
                                onClick={() => navigate(`/tontines/${id}/cotisations/stats`)}
                            />
                        )}
                        {isCreator && tontine.statut === 'EN_ATTENTE' && membresCount < tontine.nbMembresAttendu && (
                            <ActionCard
                                icon={<UserPlus color="#8B5CF6" size={24} />}
                                title="Inviter"
                                subtitle="Ajouter des membres"
                                onClick={() => navigate(`/tontines/${id}/invite`)}
                            />
                        )}
                    </div>
                </section>

                <section className="members-management-section">
                    <div className="section-header-admin">
                        <h2>Membres & Ordre ({membresCount})</h2>
                        {isCreator && tontine.statut === 'EN_ATTENTE' && orderChanged && (
                            <Button 
                                title="Enregistrer l'ordre" 
                                icon={Save} 
                                onClick={handleSaveOrder}
                                isLoading={isSavingOrder}
                            />
                        )}
                    </div>
                    
                    <div className="members-list-details premium-card">
                        {members.map((m, i) => (
                            <div key={m.userId} className="member-row-details">
                                <span className="member-rank">{i + 1}</span>
                                <div className="member-avatar-small">
                                    {m.photo ? (
                                        <img src={m.photo.startsWith('http') ? m.photo : `http://localhost:3000${m.photo}`} alt="" />
                                    ) : (
                                        <span>{m.prenom[0]}</span>
                                    )}
                                </div>
                                    <div className="member-info-small">
                                        <span className="m-name">{m.prenom} {m.nom}</span>
                                        <span className="m-email">{m.email}</span>
                                    </div>
                                    
                                    {m.distribution && (
                                        <div className="member-distribution-status">
                                            <span className="dist-amount">{Number(m.distribution.montantNet).toLocaleString('fr-FR')} F</span>
                                            <span className={`dist-pill ${m.distribution.statut}`}>
                                                {m.distribution.statut === 'EFFECTUEE' ? 'Reçu' : 'En attente'}
                                            </span>
                                        </div>
                                    )}
                                
                                {isCreator && tontine.statut === 'EN_ATTENTE' && (
                                    <div className="member-actions-small">
                                        <button className="arrow-btn" onClick={() => handleMoveMember(i, 'up')} disabled={i === 0}>
                                            <ArrowUp size={14} />
                                        </button>
                                        <button className="arrow-btn" onClick={() => handleMoveMember(i, 'down')} disabled={i === members.length - 1}>
                                            <ArrowDown size={14} />
                                        </button>
                                        <button className="remove-btn" onClick={() => handleRemoveMember(m.userId)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {isCreator && tontine.statut === 'EN_ATTENTE' && (
                    <section className="creator-actions">
                        <div className="admin-banner premium-card">
                            <div className="banner-text">
                                <h3 style={{ padding: '0.5rem 0', textAlign: 'center' }}>Lancer la tontine</h3>
                            </div>
                            <div className="banner-btns">
                                <Button 
                                    title="Démarrer" 
                                    icon={Play}
                                    onClick={handleStart}
                                />
                                <Button 
                                    title="Supprimer" 
                                    variant="danger"
                                    icon={Trash2}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
