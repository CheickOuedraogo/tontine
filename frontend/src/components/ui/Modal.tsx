import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { Button } from './Button';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'alert' | 'confirm' | 'success' | 'error' | 'info';
    confirmText?: string;
    cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Annuler'
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (onConfirm) {
                    onConfirm();
                } else {
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onConfirm]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={48} color="var(--success)" />;
            case 'error': return <AlertCircle size={48} color="var(--error)" />;
            case 'confirm': return <HelpCircle size={48} color="var(--primary)" />;
            case 'info': return <Info size={48} color="var(--primary)" />;
            default: return <Info size={48} color="var(--primary)" />;
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal-container premium-card" onClick={e => e.stopPropagation()}>
                <button className="modal-close-icon" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="modal-icon-wrapper">
                    {getIcon()}
                </div>

                <div className="modal-content">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>

                <div className="modal-actions">
                    {type === 'confirm' && (
                        <Button 
                            title={cancelText} 
                            onClick={onClose} 
                            variant="secondary"
                            className="modal-btn"
                        />
                    )}
                    <Button 
                        title={confirmText} 
                        onClick={onConfirm || onClose} 
                        className="modal-btn"
                    />
                </div>
            </div>
        </div>
    );
};
