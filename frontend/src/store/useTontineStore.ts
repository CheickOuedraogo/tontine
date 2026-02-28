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
    demanderDeblocage: (id: string) => Promise<boolean>;
    validerDeblocage: (id: string, valider: boolean) => Promise<boolean>;
    quitterEtRetirer: (id: string) => Promise<boolean>;
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

    demanderDeblocage: async (id: string) => {
        try {
            await tontineApi.demanderDeblocage(id);
            const data = await tontineApi.getTontineDetails(id);
            set({ currentTontine: data });
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Erreur déblocage' });
            return false;
        }
    },

    validerDeblocage: async (id: string, valider: boolean) => {
        try {
            await tontineApi.validerDeblocage(id, valider);
            const data = await tontineApi.getTontineDetails(id);
            set({ currentTontine: data });
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Erreur validation' });
            return false;
        }
    },

    quitterEtRetirer: async (id: string) => {
        try {
            await tontineApi.quitterEtRetirer(id);
            set((state) => ({
                tontines: state.tontines.filter(t => t.id !== id),
                currentTontine: null
            }));
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Erreur lors du départ' });
            return false;
        }
    },
}));

