import { apiClient } from './client';

export interface Tontine {
    id: string;
    nom: string;
    montantCotisation: number;
    frequence: 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE';
    dureeTotale: number;
    nbMembresAttendu: number;
    dateDebut?: string;
    dateFin?: string;
    statut: 'EN_ATTENTE' | 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
    pourcentageFrais: number;
    creatorId: string;
}

export interface CreateTontinePayload {
    nom: string;
    montantCotisation: number;
    frequence: 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE';
    dureeTotale: number;
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
    }
};
