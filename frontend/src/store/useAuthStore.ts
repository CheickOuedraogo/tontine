import { create } from 'zustand';

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
    setAuth: (token: string, refreshToken: string, user: User) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    checkAuth: () => void;
}

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

    setAuth: (token, refreshToken, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
    },

    updateUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr && !isTokenExpired(token)) {
                set({ token, user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
            } else {
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
