import apiClient from '../api/api-client';

// Auth API service for checking authentication status
export const authApi = {
  // Check if the current user is authenticated and has admin access
  async checkAdminStatus() {
    try {
      const response = await apiClient.get('/auth/admin');
      return response.data;
    } catch (error) {
      console.error('Failed to verify admin status:', error);
      return { authenticated: false, isAdmin: false };
    }
  },

  // Public check of API status
  async checkStatus() {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      console.error('Failed to check API status:', error);
      return { status: 'error' };
    }
  },
};
