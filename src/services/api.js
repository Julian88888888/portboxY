import supabase from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers (now uses Supabase session)
  async getAuthHeaders() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return {
          'Content-Type': 'application/json'
        };
      }
      
      const session = data?.session;
      const token = session?.access_token;
      
      return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };
    } catch (error) {
      console.error('Error in getAuthHeaders:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  }

  // Authentication methods (deprecated - use AuthContext instead)
  // These are kept for backward compatibility
  async register(userData) {
    console.warn('ApiService.register() is deprecated. Use AuthContext.register() instead.');
    return { success: false, error: 'Please use AuthContext for authentication' };
  }

  async login(credentials) {
    console.warn('ApiService.login() is deprecated. Use AuthContext.login() instead.');
    return { success: false, error: 'Please use AuthContext for authentication' };
  }

  async logout() {
    console.warn('ApiService.logout() is deprecated. Use AuthContext.logout() instead.');
    // Clean up legacy storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // User profile methods (deprecated - use AuthContext instead)
  async getProfile() {
    console.warn('ApiService.getProfile() is deprecated. Use AuthContext.user instead.');
    const { data: { user } } = await supabase.auth.getUser();
    return { success: true, data: user };
  }

  async updateProfile(profileData) {
    console.warn('ApiService.updateProfile() is deprecated. Use AuthContext.updateProfile() instead.');
    return { success: false, error: 'Please use AuthContext for profile updates' };
  }

  async changePassword(passwordData) {
    console.warn('ApiService.changePassword() is deprecated. Use AuthContext.changePassword() instead.');
    return { success: false, error: 'Please use AuthContext for password changes' };
  }

  // Photo upload methods (deprecated - use AuthContext instead)
  async uploadProfilePhotos(files) {
    console.warn('ApiService.uploadProfilePhotos() is deprecated. Use AuthContext.uploadProfilePhotos() instead.');
    return { success: false, error: 'Please use AuthContext for photo uploads' };
  }

  async deleteProfilePhoto(photoId) {
    console.warn('ApiService.deleteProfilePhoto() is deprecated. Use AuthContext.deleteProfilePhoto() instead.');
    return { success: false, error: 'Please use AuthContext for photo deletion' };
  }

  async setMainPhoto(photoId) {
    console.warn('ApiService.setMainPhoto() is deprecated. Use AuthContext.setMainPhoto() instead.');
    return { success: false, error: 'Please use AuthContext for setting main photo' };
  }

  // Utility methods (deprecated - use AuthContext instead)
  async isAuthenticated() {
    console.warn('ApiService.isAuthenticated() is deprecated. Use AuthContext.isAuthenticated instead.');
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async getCurrentUser() {
    console.warn('ApiService.getCurrentUser() is deprecated. Use AuthContext.user instead.');
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data || !data.user) {
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getToken() {
    console.warn('ApiService.getToken() is deprecated. Use AuthContext.session.access_token instead.');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data || !data.session) {
        return null;
      }
      return data.session.access_token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 