import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useTontineStore } from '../../store/useTontineStore';
import { Search, Users, Wallet, Calendar, Globe, UserPlus, FileText, X } from 'lucide-react';
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
    const { fetchMyTontines } = useTontineStore();
    const [tontines, setTontines] = useState<OpenTontine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Contract modal state
    const [showContract, setShowContract] = useState(false);
    const [contractText, setContractText] = useState('');
    const [contractLoading, setContractLoading] = useState(false);
    const [selectedTontine, setSelectedTontine] = useState<OpenTontine | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [joining, setJoining] = useState(false);

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

    const handleShowContract = async (tontine: OpenTontine) => {
        setSelectedTontine(tontine);
        setAccepted(false);
        setContractLoading(true);
        setShowContract(true);

        try {
            const res = await apiClient.get(`/contrats/tontine/${tontine.id}/preview`);
            const contrat = res.data.contrat;
            setContractText(contrat?.texteContrat || '');
        } catch {
            setContractText('');
        } finally {
            setContractLoading(false);
        }
    };

    const handleConfirmJoin = async () => {
        if (!selectedTontine || !accepted) return;
        setJoining(true);
        try {
            await apiClient.post(`/tontines/${selectedTontine.id}/join`);
            setShowContract(false);
            fetchMyTontines();
            alert('🎉 Vous avez rejoint la tontine !');
            navigate(`/tontines/${selectedTontine.id}`);
        } catch (err: any) {
            alert('❌ ' + (err.response?.data?.message || 'Impossible de rejoindre cette tontine.'));
        } finally {
            setJoining(false);
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
                                                <button className="e-btn join" onClick={() => handleShowContract(item)}>
                                                    <UserPlus size={18} />
                                                    Rejoindre
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

            {showContract && (
                <div className="modal-overlay-web">
                    <div className="modal-container-web premium-card">
                        <div className="modal-header-web">
                            <FileText size={20} color="var(--primary)" />
                            <h3>Termes du Contrat</h3>
                            <button className="modal-close-btn" onClick={() => setShowContract(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body-web">
                            <p className="modal-tontine-name">{selectedTontine?.nom}</p>
                            <div className="modal-scroll-area">
                                {contractLoading ? (
                                    <div className="loading-state">
                                        <div className="spinner"></div>
                                    </div>
                                ) : contractText ? (
                                    <pre className="modal-contract-text">{contractText}</pre>
                                ) : (
                                    <div className="modal-error-box">
                                        <p>Aucun contrat n'a encore été généré pour cette tontine.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {contractText && (
                            <div className="modal-footer-web">
                                <label className="modal-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={accepted} 
                                        onChange={(e) => setAccepted(e.target.checked)} 
                                    />
                                    <span>J'ai lu et j'accepte les conditions du contrat</span>
                                </label>
                                <button 
                                    className="modal-confirm-btn" 
                                    disabled={!accepted || joining}
                                    onClick={handleConfirmJoin}
                                >
                                    {joining ? 'Traitement...' : 'Signer et Rejoindre'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
