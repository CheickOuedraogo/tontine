import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dans un appareil physique il faudra utiliser l'IP de la machine, ex: 'http://192.168.1.X:3000/api'
const API_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
