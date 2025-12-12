import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file or Vercel environment variables.';
  console.error(errorMsg);
  console.error('Required variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY');
  // Don't throw error in production, but log it clearly
  if (process.env.NODE_ENV === 'development') {
    throw new Error(errorMsg);
  }
}

// Create Supabase client only if credentials are available
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
    },
  });
} else {
  // Create a mock client that will fail gracefully
  console.warn('Supabase client not initialized. Please configure environment variables.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

// Helper functions for authentication
export const supabaseAuth = {
  // Sign up with email and password
  signUp: async (email, password, metadata = {}) => {
    // Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: { 
          message: 'Email and password are required',
          status: 400
        } 
      };
    }

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Prepare metadata - ensure all values are strings or valid types
    const cleanMetadata = {};
    if (metadata.firstName) cleanMetadata.firstName = String(metadata.firstName).trim();
    if (metadata.lastName) cleanMetadata.lastName = String(metadata.lastName).trim();
    if (metadata.phone) cleanMetadata.phone = String(metadata.phone).trim();
    if (metadata.userType) cleanMetadata.userType = String(metadata.userType).trim();
    if (metadata.profilePhotos) cleanMetadata.profilePhotos = Array.isArray(metadata.profilePhotos) ? metadata.profilePhotos : [];
    if (metadata.links) cleanMetadata.links = Array.isArray(metadata.links) ? metadata.links : [];

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: cleanMetadata, // Store additional user metadata
        },
      });

      if (error) {
        console.error('Supabase signUp error:', {
          message: error.message,
          status: error.status,
          error: error
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Unexpected error in signUp:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'An unexpected error occurred',
          status: 500
        } 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    // Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: { 
          message: 'Email and password are required',
          status: 400
        } 
      };
    }

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        console.error('Supabase signIn error:', {
          message: error.message,
          status: error.status,
          error: error
        });
      }

      return { data, error };
    } catch (err) {
      console.error('Unexpected error in signIn:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'An unexpected error occurred',
          status: 500
        } 
      };
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Update user metadata
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  // Reset password for email
  resetPasswordForEmail: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default supabase;

