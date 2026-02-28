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
    type: 'CLASSIQUE' | 'ACHAT_COMMUN';
    statutDeblocage: 'NON_DEMANDE' | 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
}

export interface CreateTontinePayload {
    nom: string;
    montantCotisation: number;
    frequence: 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE';
    dureeTotale: number;
    nbMembresAttendu: number;
    pourcentageFrais?: number;
    type?: 'CLASSIQUE' | 'ACHAT_COMMUN';
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

    demanderDeblocage: async (id: string) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/tontines/${id}/demander-deblocage`);
        return response.data;
    },

    validerDeblocage: async (id: string, valider: boolean) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/tontines/${id}/valider-deblocage`, { valider });
        return response.data;
    },

    quitterEtRetirer: async (id: string) => {
        const response = await apiClient.post<{ success: boolean; message: string; montantRetire: number }>(`/tontines/${id}/quitter`);
        return response.data;
    }
};

