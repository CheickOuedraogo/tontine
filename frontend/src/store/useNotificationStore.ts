import { create } from 'zustand';
import { type AppNotification, notificationApi } from '../api/notification';

interface NotificationState {
    notifications: AppNotification[];
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
            const notifs = await notificationApi.getNotifications();
            set({ 
                notifications: Array.isArray(notifs) ? notifs : [], 
                unreadCount: Array.isArray(notifs) ? notifs.filter(n => !n.lu).length : 0,
                isLoading: false 
            });
        } catch {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            const updatedNotifs = get().notifications.map(n =>
                n.id === id ? { ...n, lu: true } : n
            );
            const newCount = Math.max(0, get().unreadCount - 1);
            set({ notifications: updatedNotifs, unreadCount: newCount });
        } catch (e) {
            // silent fail
        }
    },

    fetchUnreadCount: async () => {
        try {
            const notifs = await notificationApi.getNotifications();
            set({ unreadCount: Array.isArray(notifs) ? notifs.filter(n => !n.lu).length : 0 });
        } catch {
            // silent fail
        }
    }
}));
