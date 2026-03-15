import { apiClient } from './client';

export interface Cotisation {
    id: string;
    tontineId: string;
    userId: string;
    montant: number;
    datePrevue: string;
    datePaiement?: string;
    statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
}

export const cotisationApi = {
    getTontineCotisations: async (tontineId: string) => {
        const response = await apiClient.get<{ success: boolean; cotisations: Cotisation[] }>(`/cotisations/tontine/${tontineId}`);
        return response.data.cotisations;
    },
    payCotisation: async (id: string, simulationRef: string) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/cotisations/${id}/payer`, { simulationRef });
        return response.data;
    }
};
