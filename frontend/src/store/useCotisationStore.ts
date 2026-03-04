import { create } from 'zustand';
import { Cotisation, cotisationApi } from '../api/cotisation';

interface CotisationState {
    cotisations: Cotisation[];
    isLoading: boolean;
    error: string | null;

    fetchCotisations: (tontineId: string) => Promise<void>;
    payerCotisation: (cotisationId: string, operateur?: string) => Promise<boolean>;
}

export const useCotisationStore = create<CotisationState>((set, get) => ({
    cotisations: [],
    isLoading: false,
    error: null,

    fetchCotisations: async (tontineId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await cotisationApi.getMesCotisations(tontineId);
            set({ cotisations: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors du chargement des cotisations.',
                isLoading: false
            });
        }
    },

    payerCotisation: async (cotisationId: string, operateur?: string) => {
        set({ isLoading: true, error: null });
        try {
            await cotisationApi.payerCotisation(cotisationId, operateur);

            // Update local state to reflect payment
            const updatedCotisations = get().cotisations.map(c =>
                c.id === cotisationId ? { ...c, statut: 'PAYEE', datePaiement: new Date().toISOString() } : c
            );
            set({ cotisations: updatedCotisations as any, isLoading: false });
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
