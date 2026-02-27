import { create } from 'zustand';
import { Tontine, tontineApi, CreateTontinePayload } from '../api/tontine';

interface TontineState {
    tontines: Tontine[];
    currentTontine: Tontine | null;
    isLoading: boolean;
    error: string | null;

    fetchMyTontines: () => Promise<void>;
    fetchTontineDetails: (id: string) => Promise<void>;
    createTontine: (data: CreateTontinePayload) => Promise<Tontine | null>;
}

export const useTontineStore = create<TontineState>((set) => ({
    tontines: [],
    currentTontine: null,
    isLoading: false,
    error: null,

    fetchMyTontines: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await tontineApi.getMyTontines();
            set({ tontines: data || [], isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des tontines',
                isLoading: false
            });
        }
    },

    fetchTontineDetails: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await tontineApi.getTontineDetails(id);
            set({ currentTontine: data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des détails',
                isLoading: false
            });
        }
    },

    createTontine: async (data: CreateTontinePayload) => {
        set({ isLoading: true, error: null });
        try {
            const newTontine = await tontineApi.createTontine(data);
            set((state) => ({
                tontines: [newTontine, ...state.tontines],
                isLoading: false
            }));
            return newTontine;
        } catch (error: any) {
            console.error('[useTontineStore] createTontine error:', error.response?.status, error.response?.data || error.message);
            set({
                error: error.response?.data?.message || 'Erreur lors de la création',
                isLoading: false
            });
            return null;
        }
    },
}));
