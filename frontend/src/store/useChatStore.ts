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

        // Nettoyer proprement l'ancien socket et ses listeners
        const oldSocket = get().socket;
        if (oldSocket) {
            oldSocket.removeAllListeners();
            oldSocket.disconnect();
        }

        set({ messages: [], currentTontineId: tontineId, socket: null, isConnected: false });

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        // Stocker le socket immédiatement pour éviter les créations multiples
        set({ socket });

        socket.on('connect', () => {
            set({ isConnected: true });
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
            socket.removeAllListeners();
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
        set((state) => {
            // Éviter les doublons par id
            if (message.id && state.messages.some(m => m.id === message.id)) {
                return state;
            }
            return { messages: [message, ...state.messages] };
        });
    }
}));
