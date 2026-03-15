import { apiClient } from './client';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    titre: string;
    contenu: string;
    estLue: boolean;
    dateCreation: string;
    lienAction: string | null;
}

export const notificationApi = {
    getNotifications: async () => {
        const response = await apiClient.get('/notifications');
        return response.data;
    },

    marquerLue: async (id: string) => {
        const response = await apiClient.put(`/notifications/${id}/lire`);
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get('/notifications/unread-count');
            // Handle various response formats
            const data = response.data;
            if (data?.data?.unreadCount !== undefined) return data.data.unreadCount;
            if (data?.unreadCount !== undefined) return data.unreadCount;
            if (typeof data?.data === 'number') return data.data;
            return 0;
        } catch {
            return 0;
        }
    }
};
