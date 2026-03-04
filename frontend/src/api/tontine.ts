import { apiClient } from './client';

export interface Tontine {
    id: string;
    nom: string;
    montantCotisation: number;
    intervalleJours: number;
    nbMembresAttendu: number;
    dateDebut?: string;
    dateFin?: string;
    statut: 'EN_ATTENTE' | 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
    creatorId: string;
}

export interface CreateTontinePayload {
    nom: string;
    montantCotisation: number;
    intervalleJours: number;
    nbMembresAttendu: number;
}

export const tontineApi = {
    getMyTontines: async () => {
        const response = await apiClient.get<{ success: boolean; tontines: Tontine[] }>('/tontines/me');
        return response.data.tontines;
    },

    getTontineDetails: async (id: string) => {
        const response = await apiClient.get<{ success: boolean; tontine: Tontine }>(`/tontines/${id}`);
        return response.data.tontine;
    },

    createTontine: async (data: CreateTontinePayload) => {
        const response = await apiClient.post<{ success: boolean; tontine: Tontine }>('/tontines', data);
        return response.data.tontine;
    },

    startTontine: async (id: string) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/tontines/${id}/start`);
        return response.data;
    },

    joinTontine: async (id: string) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/tontines/${id}/join`);
        return response.data;
    },

    deleteTontine: async (id: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/tontines/${id}`);
        return response.data;
    },
    removeMember: async (tontineId: string, userId: string) => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/tontines/${tontineId}/membres/${userId}`);
        return response.data;
    },
    updateMembresOrdre: async (tontineId: string, ordre: { userId: string; ordre: number }[]) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/tontines/${tontineId}/membres/ordre`, { ordre });
        return response.data;
    },
};
