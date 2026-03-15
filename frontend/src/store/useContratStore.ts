import { create } from 'zustand';
import { type Contrat, type Signature, contratApi } from '../api/contrat';

interface ContratState {
    currentContrat: Contrat | null;
    signatures: Signature[];
    isLoading: boolean;
    error: string | null;

    fetchContrat: (tontineId: string) => Promise<void>;
    fetchSignatures: (contratId: string) => Promise<void>;
    signerContrat: (contratId: string) => Promise<boolean>;
}

export const useContratStore = create<ContratState>((set, get) => ({
    currentContrat: null,
    signatures: [],
    isLoading: false,
    error: null,

    fetchContrat: async (tontineId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await contratApi.getContrat(tontineId);
            set({ currentContrat: data, isLoading: false });
        } catch (error: any) {
            if (error.response?.status === 404) {
                set({ currentContrat: null, isLoading: false, error: null });
            } else {
                set({
                    error: error.response?.data?.message || 'Erreur lors du chargement du contrat',
                    isLoading: false,
                    currentContrat: null
                });
            }
        }
    },

    fetchSignatures: async (contratId: string) => {
        try {
            const data = await contratApi.getSignatures(contratId);
            set({ signatures: data });
        } catch (e) {
            // Silent catch
        }
    },

    signerContrat: async (contratId: string) => {
        set({ isLoading: true, error: null });
        try {
            await contratApi.signerContrat(contratId);
            await get().fetchSignatures(contratId);
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors de la signature',
                isLoading: false
            });
            return false;
        }
    }
}));
