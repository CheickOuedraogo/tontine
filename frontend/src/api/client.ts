import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Intercepteur de requête : injecter le token JWT ──────────────────────────
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Intercepteur de réponse : gérer les erreurs globalement ─────────────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        // Token expiré ou invalide → vider la session et forcer la reconnexion
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // L'import dynamique évite une dépendance circulaire avec le store
            const { useAuthStore } = await import('../store/useAuthStore');
            useAuthStore.getState().logout();
        }

        return Promise.reject(error);
    }
);
