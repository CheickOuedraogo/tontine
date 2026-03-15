import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export interface ChatMessage {
    id: string;
    tontineId: string;
    senderId: string;
    contenu: string;
    dateEnvoi: string;
    typeMessage: 'text' | 'system';
    senderName?: string;
}

interface ChatState {
    socket: Socket | null;
    messages: ChatMessage[];
    isConnected: boolean;
    currentTontineId: string | null;

    connect: (tontineId: string) => Promise<void>;
    disconnect: () => void;
    sendMessage: (contenu: string, tontineId: string) => void;
    addMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    messages: [],
    isConnected: false,
    currentTontineId: null,

    connect: async (tontineId: string) => {
        const token = localStorage.getItem('token');
        const { currentTontineId } = get();

        if (get().socket) {
            get().socket?.disconnect();
        }

        if (currentTontineId !== tontineId) {
            set({ messages: [], currentTontineId: tontineId });
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            set({ isConnected: true, socket });
            socket.emit('join_room', { tontineId });
        });

        socket.on('chat_history', (history: ChatMessage[]) => {
            set({ messages: Array.isArray(history) ? history : [] });
        });

        socket.on('new_message', (message: ChatMessage) => {
            get().addMessage(message);
        });

        socket.on('connect_error', () => {
            set({ isConnected: false });
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    sendMessage: (contenu: string, tontineId: string) => {
        const { socket } = get();
        if (socket && contenu.trim()) {
            socket.emit('send_message', { tontineId, contenu });
        }
    },

    addMessage: (message: ChatMessage) => {
        set((state) => ({
            messages: [message, ...state.messages]
        }));
    }
}));
