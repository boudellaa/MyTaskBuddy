import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000',
});

// Axios request interceptor
// axiosClient.interceptors.request.use(
//     async (config) => {
//         const accessToken = JSON.parse(localStorage.getItem('sb-svlrsvxrzxkqrhhpwkzw-auth-token'));
//         const expiresAt = parseInt(accessToken?.expires_at || '0');
//         if (accessToken && expiresAt) {
//             if (isTokenExpired(expiresAt)) {
//                 handleTokenExpiration();
//                 return Promise.reject(new Error('Token expired'));
//             }
//             config.headers['Authorization'] = `Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export default axiosClient;
