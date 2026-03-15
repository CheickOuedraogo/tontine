import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { apiClient } from '../../api/client';
import { useTontineStore } from '../../store/useTontineStore';
import { Search, Users, Wallet, Calendar, Globe, UserPlus } from 'lucide-react';
import './ExploreScreen.css';

interface OpenTontine {
    id: string;
    nom: string;
    montantCotisation: number;
    frequence: string;
    dureeTotale: number;
    nbMembresAttendu: number;
    nbMembresActuel: number;
    creatorNom: string;
    creatorPrenom: string;
    pourcentageFrais: number;
    estMembre: boolean;
}

const FREQ_FR: Record<string, string> = {
    QUOTIDIENNE: 'Quotidienne',
    HEBDOMADAIRE: 'Hebdomadaire',
    MENSUELLE: 'Mensuelle',
    TRIMESTRIELLE: 'Trimestrielle',
};

export const ExploreScreen = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const { fetchMyTontines } = useTontineStore();
    const [tontines, setTontines] = useState<OpenTontine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [selectedTontine, setSelectedTontine] = useState<OpenTontine | null>(null);

    useEffect(() => {
        loadOpen();
    }, []);

    const loadOpen = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/tontines/open');
            const data = res.data.tontines || res.data.data || res.data;
            setTontines(Array.isArray(data) ? data : []);
        } catch {
            setTontines([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (tontine: OpenTontine) => {
        const confirmed = await showConfirm(
            'Rejoindre la tontine',
            `Voulez-vous vraiment rejoindre la tontine "${tontine.nom}" ?`
        );
        if (!confirmed) return;

        setJoining(true);
        setSelectedTontine(tontine);
        try {
            await apiClient.post(`/tontines/${tontine.id}/join`);
            fetchMyTontines();
            showAlert('Félicitations !', '🎉 Vous avez rejoint la tontine !', 'success');
            navigate(`/tontines/${tontine.id}`);
        } catch (err: any) {
            showAlert('Erreur', err.response?.data?.message || 'Impossible de rejoindre cette tontine.', 'error');
        } finally {
            setJoining(false);
            setSelectedTontine(null);
        }
    };

    return (
        <div className="explore-page">
            <header className="details-header explore-header">
                <div className="explore-header-icon">
                    <Globe size={24} color="white" />
                </div>
                <div className="header-titles">
                    <h1>Explorer les Tontines</h1>
                    <p className="header-subtitle-web">{tontines.length} opportunités disponibles</p>
                </div>
            </header>

            <div className="explore-content-container">
                <div className="search-filter-bar premium-card">
                    <div className="search-input-wrapper">
                        <Search size={20} />
                        <input type="text" placeholder="Rechercher une tontine..." />
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Recherche des meilleures tontines...</p>
                    </div>
                ) : (
                    <div className="explore-list-web">
                        {tontines.map((item) => {
                            const spotsLeft = item.nbMembresAttendu - item.nbMembresActuel;
                            return (
                                <div key={item.id} className="explore-card-web premium-card">
                                    <div className="e-card-main">
                                        <div className="e-card-header">
                                            <div className="e-card-titles">
                                                <h3>{item.nom}</h3>
                                                <span className="e-creator">Créé par {item.creatorPrenom} {item.creatorNom}</span>
                                            </div>
                                            <div className="e-spots-badge">
                                                <span>{spotsLeft} places dispo</span>
                                            </div>
                                        </div>

                                        <div className="e-stats-grid">
                                            <div className="e-stat">
                                                <Wallet size={14} />
                                                <span>{Number(item.montantCotisation).toLocaleString('fr-FR')} F</span>
                                            </div>
                                            <div className="e-stat">
                                                <Calendar size={14} />
                                                <span>{FREQ_FR[item.frequence] || item.frequence}</span>
                                            </div>
                                            <div className="e-stat">
                                                <Users size={14} />
                                                <span>{item.nbMembresActuel}/{item.nbMembresAttendu}</span>
                                            </div>
                                        </div>

                                        <div className="e-actions">
                                            {item.estMembre ? (
                                                <button className="e-btn member" disabled>
                                                    Déjà membre
                                                </button>
                                            ) : (
                                                <button 
                                                    className="e-btn join" 
                                                    onClick={() => handleJoin(item)} 
                                                    disabled={joining && selectedTontine?.id === item.id}
                                                >
                                                    <UserPlus size={18} />
                                                    {joining && selectedTontine?.id === item.id ? 'Traitement...' : 'Rejoindre'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {tontines.length === 0 && (
                            <div className="empty-state premium-card">
                                <div className="empty-icon-circle">
                                    <Search size={36} />
                                </div>
                                <h3>Aucune tontine trouvée</h3>
                                <p>Revenez plus tard ou créez votre propre tontine !</p>
                                <button className="e-empty-btn" onClick={() => navigate('/tontines/create')}>
                                    Créer une tontine
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
