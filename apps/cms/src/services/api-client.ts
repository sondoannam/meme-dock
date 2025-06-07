import axios from 'axios';
// import { CollectionSchemaType } from '@/validators/collection-schema';
// import { toast } from '@/components/ui/use-toast';

const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    // toast({
    //   title: 'Error',
    //   description: message,
    //   variant: 'destructive',
    // });
    return Promise.reject(error);
  },
);

export default apiClient;
