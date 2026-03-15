import { create } from 'zustand';
import { type Cotisation, cotisationApi } from '../api/cotisation';

interface CotisationState {
    cotisations: Cotisation[];
    isLoading: boolean;
    error: string | null;

    fetchCotisations: (tontineId: string) => Promise<void>;
    payerCotisation: (cotisationId: string, simulationRef: string, operateur?: string) => Promise<boolean>;
}

export const useCotisationStore = create<CotisationState>((set) => ({
    cotisations: [],
    isLoading: false,
    error: null,

    fetchCotisations: async (tontineId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await cotisationApi.getTontineCotisations(tontineId);
            set({ cotisations: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors du chargement des cotisations.',
                isLoading: false
            });
        }
    },

    payerCotisation: async (cotisationId: string, simulationRef: string, _operateur?: string) => {
        set({ isLoading: true, error: null });
        try {
            await cotisationApi.payCotisation(cotisationId, simulationRef);

            // Update local state to reflect payment
            set((state) => ({
                cotisations: state.cotisations.map(c =>
                    c.id === cotisationId ? { ...c, statut: 'PAYEE', datePaiement: new Date().toISOString() } : c
                ),
                isLoading: false
            }));
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors du paiement.',
                isLoading: false
            });
            return false;
        }
    }
}));
