import axios from 'axios';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';
// import { CollectionSchemaType } from '@/validators/collection-schema';
// import { toast } from '@/components/ui/use-toast';

const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3001/api';
console.log(`API URL: ${API_URL}`);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenRefreshPromise: Promise<string> | null = null;
// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // First check if there's a token in storage
      let token = TokenService.getToken();

      // If token is expired or not found, request a new one
      if (!token || TokenService.isTokenExpired()) {
        if (!tokenRefreshPromise) {
          tokenRefreshPromise = AuthService.getJWT();
        }
        token = await tokenRefreshPromise;
        tokenRefreshPromise = null;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error adding JWT to request:', error);
      tokenRefreshPromise = null;
      // If we can't get a token, continue with the request anyway
      // The API will reject it if authentication is required
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Extract error details
    const { response } = error;
    const statusCode = response?.status;
    const message = response?.data?.message || error.message || 'An unexpected error occurred';

    console.error(`API Error ${statusCode}:`, message);

    // Handle authentication errors
    if (statusCode === 401 || statusCode === 403) {
      // Clear token for all auth errors, or check specific error codes
      const errorCode = response?.data?.code;
      if (
        statusCode === 401 ||
        errorCode === 'INVALID_TOKEN' ||
        errorCode === 'TOKEN_EXPIRED' ||
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('authentication')
      ) {
        TokenService.clearToken();

        // We don't trigger navigation here as it can cause issues in API interceptors
        // The session recovery hook in components will handle this
      }
    }

    // toast({
    //   title: 'Error',
    //   description: message,
    //   variant: 'destructive',
    // });

    return Promise.reject(error);
  },
);

export default apiClient;
