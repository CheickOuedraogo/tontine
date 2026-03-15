import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ChevronLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import './CreateTontineScreen.css';

export const CreateTontineScreen = () => {
    const navigate = useNavigate();
    
    const [nom, setNom] = useState('');
    const [montantCotisation, setMontantCotisation] = useState('');
    const [intervalleJours, setIntervalleJours] = useState('30');
    const [nbMembresAttendu, setNbMembresAttendu] = useState('');

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom || !montantCotisation || !intervalleJours || !nbMembresAttendu) {
            alert('Veuillez remplir tous les champs pour continuer.');
            return;
        }

        const payload = {
            nom,
            montantCotisation: Number(montantCotisation),
            intervalleJours: Number(intervalleJours),
            nbMembresAttendu: Number(nbMembresAttendu),
        };

        // Navigate to confirmation with state
        navigate('/tontines/create/confirm', { state: { tontineData: payload } });
    };

    return (
        <div className="create-tontine-page">
            <header className="create-header">
                <button onClick={() => navigate(-1)} className="back-btn-circle">
                    <ChevronLeft size={24} />
                </button>
                <div className="header-icon-main">
                    <FilePlus size={32} />
                </div>
                <h1>Nouvelle Tontine</h1>
                <p>Configurez les paramètres de votre tontine</p>
            </header>

            <div className="premium-card create-card">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-line"></div>
                    <div className="step-dot"></div>
                </div>
                <p className="step-label">Étape 1 / 2 - Informations</p>

                <form onSubmit={handleContinue}>
                    <Input
                        label="Nom de la Tontine"
                        placeholder="Ex: Tontine Famille"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                    />

                    <Input
                        label="Montant de la Cotisation (FCFA)"
                        placeholder="Ex: 50000"
                        type="number"
                        value={montantCotisation}
                        onChange={(e) => setMontantCotisation(e.target.value)}
                        required
                    />

                    <Input
                        label="Intervalle entre cotisations (jours)"
                        placeholder="Ex: 30"
                        type="number"
                        value={intervalleJours}
                        onChange={(e) => setIntervalleJours(e.target.value)}
                        required
                    />

                    <Input
                        label="Nombre de membres attendus"
                        placeholder="Ex: 10"
                        type="number"
                        value={nbMembresAttendu}
                        onChange={(e) => setNbMembresAttendu(e.target.value)}
                        required
                    />

                    <Button
                        title="Continuer"
                        type="submit"
                        className="continue-btn"
                    />
                </form>
            </div>
        </div>
    );
};
