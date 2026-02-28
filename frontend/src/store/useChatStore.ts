import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    connect: (tontineId: string) => Promise<void>;
    disconnect: () => void;
    sendMessage: (contenu: string, tontineId: string) => void;
    addMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    messages: [],
    isConnected: false,

    connect: async (tontineId: string) => {
        const token = await AsyncStorage.getItem('token');

        // Éviter les connexions multiples
        if (get().socket) {
            get().socket?.disconnect();
        }

        // Reset messages for the new room
        set({ messages: [] });

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('[Chat] Connected to socket');
            set({ isConnected: true, socket });
            // Rejoindre la room — backend sends chat_history automatically
            socket.emit('join_room', { tontineId });
        });

        // Receive chat history (sent by backend on join_room)
        socket.on('chat_history', (history: ChatMessage[]) => {
            console.log('[Chat] History received:', history.length, 'messages');
            set({ messages: Array.isArray(history) ? history : [] });
        });

        socket.on('new_message', (message: ChatMessage) => {
            console.log('[Chat] New message received:', message.contenu);
            get().addMessage(message);
        });

        socket.on('connect_error', (err) => {
            console.error('[Chat] Connection error:', err.message);
            set({ isConnected: false });
        });

        socket.on('disconnect', () => {
            console.log('[Chat] Disconnected');
            set({ isConnected: false });
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
            // NOTE: we do NOT clear messages so they persist if user navigates back
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
            // Prepend because FlatList is inverted
            messages: [message, ...state.messages]
        }));
    }
}));
