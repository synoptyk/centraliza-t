import axios from 'axios';
import API_URL from '../config/api';

// Instancia centralizada de API
const api = axios.create({
    baseURL: API_URL + '/api',
    timeout: 45000,
});

// Interceptor de Peticiones: Inyecta el token en cada llamada
api.interceptors.request.use(
    (config) => {
        const userData = localStorage.getItem('centralizat_user') || sessionStorage.getItem('centralizat_user');
        if (userData) {
            const { token } = JSON.parse(userData);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas: Manejo global de errores (ej: 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Sesión expirada o no autorizada. Redirigiendo a login...');
            // Opcional: Limpiar almacenamiento y redirigir
            // localStorage.removeItem('centralizat_user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
