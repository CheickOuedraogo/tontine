import { create } from 'zustand';
import { type AppNotification, notificationApi } from '../api/notification';

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
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
    },

    deleteNotification: async (id: string) => {
        try {
            await notificationApi.deleteNotification(id);
            const updatedNotifs = get().notifications.filter(n => n.id !== id);
            const wasUnread = get().notifications.find(n => n.id === id && !n.lu);
            const newCount = wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount;
            set({ notifications: updatedNotifs, unreadCount: newCount });
        } catch (e) {
            // silent fail
        }
    },

    clearAllNotifications: async () => {
        try {
            await notificationApi.clearAll();
            set({ notifications: [], unreadCount: 0 });
        } catch (e) {
            // silent fail
        }
    }
}));
