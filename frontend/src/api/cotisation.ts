import { apiClient } from './client';

export interface Cotisation {
    id: string;
    participationId: string;
    tontineId: string;
    montant: number;
    datePrevue: string;
    datePaiement: string | null;
    statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
    simulationRef: string | null;
    cycleNumero: number;
}

export const cotisationApi = {
    getMesCotisations: async (tontineId: string) => {
        const response = await apiClient.get<{ success: boolean; cotisations: Cotisation[] }>(`/cotisations/tontine/${tontineId}`);
        return response.data.cotisations;
    },

    payerCotisation: async (cotisationId: string, simulationRef: string = `SIM-${Date.now()}`) => {
        const response = await apiClient.post<{ success: boolean; cotisation: Cotisation }>(`/cotisations/${cotisationId}/payer`, {
            simulationRef
        });
        return response.data;
    }
};
