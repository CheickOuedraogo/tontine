import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    roleSysteme: string;
    photo?: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (token: string, refreshToken: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

/** Décode le payload JWT sans vérifier la signature (vérification faite côté serveur uniquement). */
const decodeJwtPayload = (token: string): { exp?: number } | null => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (token, refreshToken, user) => {
        await AsyncStorage.multiSet([
            ['token', token],
            ['refreshToken', refreshToken],
            ['user', JSON.stringify(user)],
        ]);
        set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
        try {
            const [[, token], [, userStr]] = await AsyncStorage.multiGet(['token', 'user']);

            if (token && userStr && !isTokenExpired(token)) {
                set({ token, user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
            } else {
                // Token absent ou expiré : nettoyer le stockage
                if (token) await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));

