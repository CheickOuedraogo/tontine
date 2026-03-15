import { create } from 'zustand';
import { type Tontine, tontineApi, type CreateTontinePayload } from '../api/tontine';

import { apiClient } from '../api/client';

interface TontineState {
    tontines: Tontine[];
    currentTontine: Tontine | null;
    invitations: any[];
    isLoading: boolean;
    error: string | null;

    fetchMyTontines: () => Promise<void>;
    fetchTontineDetails: (id: string) => Promise<void>;
    fetchInvitations: () => Promise<void>;
    createTontine: (data: CreateTontinePayload) => Promise<Tontine | null>;
    deleteTontine: (id: string) => Promise<boolean>;
    respondToInvitation: (invitationId: string, action: 'accepter' | 'refuser') => Promise<boolean>;
}

export const useTontineStore = create<TontineState>((set, get) => ({
    tontines: [],
    currentTontine: null,
    invitations: [],
    isLoading: false,
    error: null,

    fetchInvitations: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await apiClient.get('/invitations/me');
            set({ invitations: res.data.invitations || [], isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des invitations',
                isLoading: false
            });
        }
    },

    respondToInvitation: async (invitationId, action) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.post(`/invitations/${invitationId}/${action}`);
            const { fetchInvitations, fetchMyTontines } = get();
            await fetchInvitations();
            await fetchMyTontines();
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors de la reponse',
                isLoading: false
            });
            return false;
        }
    },

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
                error: error.response?.data?.message || 'Erreur de chargement des details',
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
            set({
                error: error.response?.data?.message || 'Erreur lors de la creation',
                isLoading: false
            });
            return null;
        }
    },

    deleteTontine: async (id: string) => {
        try {
            await tontineApi.deleteTontine(id);
            set((state) => ({
                tontines: state.tontines.filter(t => t.id !== id),
                currentTontine: null
            }));
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Erreur lors de la suppression' });
            return false;
        }
    },
}));
