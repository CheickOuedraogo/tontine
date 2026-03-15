import { apiClient } from './client';

export interface AppNotification {
    id: string;
    userId: string;
    titre: string;
    message: string;
    type: string;
    lu: boolean;
    dateCreation: string;
}

export const notificationApi = {
    getNotifications: async () => {
        const response = await apiClient.get<{ success: boolean; notifications: AppNotification[] }>('/notifications');
        return response.data.notifications;
    },
    markAsRead: async (id: string) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await apiClient.put<{ success: boolean; message: string }>('/notifications/read-all');
        return response.data;
    }
};
