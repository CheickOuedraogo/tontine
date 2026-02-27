import { apiClient } from './client';

export interface Contrat {
    id: string;
    tontineId: string;
    texteContrat: string;
    dateCreation: string;
}

export interface Signature {
    id: string;
    userId: string;
    dateSignature: string;
    accepte: boolean;
}

export const contratApi = {
    getContrat: async (tontineId: string) => {
        const response = await apiClient.get<{ success: boolean; contrat: Contrat }>(`/contrats/tontine/${tontineId}`);
        return response.data.contrat;
    },

    createContrat: async (tontineId: string, texteContrat: string) => {
        const response = await apiClient.post<{ success: boolean; contrat: Contrat }>(`/contrats/tontine/${tontineId}`, { texteContrat });
        return response.data.contrat;
    },

    getSignatures: async (contratId: string) => {
        const response = await apiClient.get<{ success: boolean; signatures: Signature[] }>(`/contrats/${contratId}/signatures`);
        return response.data.signatures;
    },

    signerContrat: async (contratId: string) => {
        const response = await apiClient.post<{ success: boolean; signature: Signature }>(`/contrats/${contratId}/signer`);
        return response.data;
    }
};
