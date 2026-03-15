import { useNavigate, useLocation } from 'react-router-dom';
import { useTontineStore } from '../../store/useTontineStore';
import { Button } from '../../components/ui/Button';
import { FileCheck, Users, Calendar, Wallet, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import './ConfirmTontineScreen.css';

export const ConfirmTontineScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tontineData } = (location.state as any) || { tontineData: {} };
    
    const { showAlert } = useModal();
    const { createTontine, isLoading, fetchMyTontines, error } = useTontineStore();

    const handlePublish = async () => {
        const result = await createTontine(tontineData);
        if (result) {
            await fetchMyTontines();
            navigate('/');
        } else {
            showAlert('Erreur', error || 'Impossible de créer la tontine.', 'error');
        }
    };

    const infoRows = [
        { icon: <Wallet color="#6366F1" size={20} />, label: 'Nom', value: tontineData.nom },
        { icon: <Wallet color="#059669" size={20} />, label: 'Cotisation', value: `${Number(tontineData.montantCotisation).toLocaleString('fr-FR')} FCFA` },
        { icon: <Calendar color="#D97706" size={20} />, label: 'Intervalle', value: `Tous les ${tontineData.intervalleJours} jours` },
        { icon: <Users color="#6366F1" size={20} />, label: 'Membres', value: `${tontineData.nbMembresAttendu} personnes` },
    ];

    return (
        <div className="confirm-tontine-page">
            <header className="create-header">
                <button onClick={() => navigate(-1)} className="back-btn-circle">
                    <ChevronLeft size={24} />
                </button>
                <div className="header-icon-main success">
                    <FileCheck size={32} />
                </div>
                <h1>Vérifier et Publier</h1>
                <p>Relisez les informations avant de publier</p>
                
                <div className="step-indicator">
                    <div className="step-dot done"></div>
                    <div className="step-line done"></div>
                    <div className="step-dot active"></div>
                </div>
                <p className="step-label">Étape 2 / 2 - Confirmation</p>
            </header>

            <div className="premium-card confirm-card">
                <div className="info-rows">
                    {infoRows.map((row, i) => (
                        <div key={i} className="info-row">
                            <div className="info-left">
                                <div className="info-icon-bg">
                                    {row.icon}
                                </div>
                                <span className="info-label">{row.label}</span>
                            </div>
                            <span className="info-value">{row.value}</span>
                        </div>
                    ))}
                </div>

                <div className="trust-badge">
                    <ShieldCheck color="#4338CA" size={20} />
                    <span>Tontine sécurisée et gérée par TontineFit</span>
                </div>

                <div className="confirm-actions">
                    <Button 
                        title="Publier la tontine" 
                        onClick={handlePublish} 
                        isLoading={isLoading} 
                        className="publish-btn" 
                    />
                    <Button 
                        title="Modifier" 
                        variant="outline" 
                        onClick={() => navigate(-1)} 
                        className="modify-btn" 
                    />
                </div>
            </div>
        </div>
    );
};
