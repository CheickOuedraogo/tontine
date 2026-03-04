import { create } from 'zustand';
import { Notification, notificationApi } from '../api/notification';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const result = await notificationApi.getNotifications();
            const notifs = result?.data?.notifications || result?.data || [];
            set({ notifications: Array.isArray(notifs) ? notifs : [], isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await notificationApi.marquerLue(id);

            const updatedNotifs = get().notifications.map(n =>
                n.id === id ? { ...n, estLue: true } : n
            );

            const newCount = Math.max(0, get().unreadCount - 1);

            set({ notifications: updatedNotifs, unreadCount: newCount });
        } catch (e) {
            // Error handling left empty as per production best practices for silent failable UI updates
        }
    },

    fetchUnreadCount: async () => {
        try {
            const count = await notificationApi.getUnreadCount();
            set({ unreadCount: count || 0 });
        } catch {
            set({ unreadCount: 0 });
        }
    }
}));
