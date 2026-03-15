import { Wallet, Clock, ChevronRight } from 'lucide-react';
import './TontineCard.css';

interface TontineCardProps {
    nom: string;
    montantCotisation: number;
    intervalleJours?: number;
    statut: string;
    onClick?: () => void;
}

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: 'Active', bg: '#D1FAE5', color: '#059669' },
    EN_ATTENTE: { label: 'En attente', bg: '#FEF3C7', color: '#D97706' },
    TERMINEE: { label: 'Terminée', bg: '#E0E7FF', color: '#4338CA' },
    ANNULEE: { label: 'Annulée', bg: '#FEE2E2', color: '#DC2626' },
};

export const TontineCard = ({ nom, montantCotisation, intervalleJours, statut, onClick }: TontineCardProps) => {
    const statusInfo = statutLabels[statut] || statutLabels.EN_ATTENTE;

    return (
        <div className="tontine-card" onClick={onClick}>
            <div className="accent-bar" style={{ backgroundColor: statusInfo.color }}></div>
            
            <div className="card-content">
                <div className="card-top">
                    <div className="name-section">
                        <div className="avatar-circle">
                            {nom.charAt(0).toUpperCase()}
                        </div>
                        <h3>{nom}</h3>
                    </div>
                    <span className="status-badge" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.label}
                    </span>
                </div>

                <div className="card-footer">
                    <div className="details-box">
                        <div className="detail-item">
                            <Wallet size={16} className="detail-icon wallet" />
                            <span className="detail-value">{montantCotisation.toLocaleString('fr-FR')}</span>
                            <span className="detail-unit">FCFA</span>
                        </div>
                        <div className="box-separator"></div>
                        <div className="detail-item">
                            <Clock size={16} className="detail-icon clock" />
                            <span className="detail-value">{intervalleJours || '?'} jours</span>
                        </div>
                    </div>
                    <ChevronRight size={20} className="chevron-icon" />
                </div>
            </div>
        </div>
    );
};
