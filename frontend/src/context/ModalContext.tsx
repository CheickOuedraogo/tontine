import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal } from '../components/ui/Modal';

type ModalType = 'alert' | 'confirm' | 'success' | 'error' | 'info';

interface ModalOptions {
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    showAlert: (title: string, message: string, type?: ModalType) => Promise<void>;
    showConfirm: (title: string, message: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalConfig, setModalConfig] = useState<ModalOptions | null>(null);

    const showAlert = (title: string, message: string, type: ModalType = 'info'): Promise<void> => {
        return new Promise((resolve) => {
            setModalConfig({
                title,
                message,
                type,
                onConfirm: () => {
                    setModalConfig(null);
                    resolve();
                }
            });
        });
    };

    const showConfirm = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalConfig({
                title,
                message,
                type: 'confirm',
                confirmText: 'Confirmer',
                cancelText: 'Annuler',
                onConfirm: () => {
                    setModalConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(false);
                }
            });
        });
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {modalConfig && (
                <Modal
                    isOpen={true}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                    confirmText={modalConfig.confirmText}
                    cancelText={modalConfig.cancelText}
                    onClose={() => {
                        if (modalConfig.onCancel) {
                            modalConfig.onCancel();
                        } else if (modalConfig.onConfirm) {
                            modalConfig.onConfirm();
                        }
                        setModalConfig(null);
                    }}
                    onConfirm={modalConfig.onConfirm}
                />
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
