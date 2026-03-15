import { apiClient } from './client';

export interface Contrat {
    id: string;
    tontineId: string;
    texteContrat: string;
    dateCreation: string;
}

export interface Signature {
    id: string;
    contratId: string;
    userId: string;
    dateSignature: string;
    nom?: string;
    prenom?: string;
}

export const contratApi = {
    getContrat: async (tontineId: string) => {
        const response = await apiClient.get<{ success: boolean; contrat: Contrat }>(`/contrats/tontine/${tontineId}`);
        return response.data.contrat;
    },
    getSignatures: async (contratId: string) => {
        const response = await apiClient.get<{ success: boolean; signatures: Signature[] }>(`/contrats/${contratId}/signatures`);
        return response.data.signatures;
    },
    signerContrat: async (contratId: string) => {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/contrats/${contratId}/signer`);
        return response.data;
    },
    createContrat: async (tontineId: string, texte: string) => {
        const response = await apiClient.post<{ success: boolean; contrat: Contrat }>(`/contrats`, { tontineId, texteContrat: texte });
        return response.data.contrat;
    }
};
