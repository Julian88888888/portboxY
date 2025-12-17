import supabase from './supabase';
import { supabaseAuth } from './supabase';

/**
 * Get current user's profile
 */
export const getProfile = async () => {
  try {
    const { user, error: getUserError } = await supabaseAuth.getUser();
    
    if (getUserError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If profile doesn't exist, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * Upsert (insert or update) profile
 */
export const upsertProfile = async (payload) => {
  try {
    const { user, error: getUserError } = await supabaseAuth.getUser();
    
    if (getUserError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...payload,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
};

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username, currentUserId) => {
  try {
    // Validate input
    if (!username || typeof username !== 'string') {
      return { available: false, message: 'Invalid username' };
    }

    // Clean username
    const cleanedUsername = username.trim().replace(/^@+/, '');
    if (!cleanedUsername) {
      return { available: false, message: 'Username cannot be empty' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanedUsername);

    if (error) {
      console.error('Supabase error checking username:', error);
      // If table doesn't exist or RLS issue, return available (allow user to proceed)
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.warn('Profiles table may not exist yet, allowing username');
        return { available: true };
      }
      // For other errors, throw to be caught by caller
      throw new Error(`Database error: ${error.message || 'Failed to check username availability'}`);
    }

    // Username is available if no results, or if the only result is the current user
    if (!data || data.length === 0) {
      return { available: true };
    }

    if (data.length === 1 && data[0].id === currentUserId) {
      return { available: true };
    }

    return { available: false, message: 'Username is already taken' };
  } catch (error) {
    console.error('Error checking username availability:', error);
    // Return a user-friendly error instead of throwing
    return { 
      available: false, 
      message: error.message || 'Unable to verify username availability. Please try again.' 
    };
  }
};

/**
 * Upload avatar to storage
 * Uses profile-photos bucket with path: {userId}/profile_photo/{timestamp}-{filename}
 */
export const uploadAvatar = async (file) => {
  try {
    // Get session first to ensure we have a valid token
    const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();
    
    if (sessionError || !sessionData?.session?.user) {
      throw new Error('User not authenticated');
    }

    const user = sessionData.session.user;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a JPG, PNG, or WebP image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${user.id}/profile_photo/${timestamp}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    return fileName; // Return path, not URL
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Upload header photo to storage
 * Uses profile-headers bucket with path: {userId}/profile_header/{timestamp}-{filename}
 */
export const uploadHeader = async (file) => {
  try {
    // Get session first to ensure we have a valid token
    const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();
    
    if (sessionError || !sessionData?.session?.user) {
      throw new Error('User not authenticated');
    }

    const user = sessionData.session.user;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a JPG, PNG, or WebP image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${user.id}/profile_header/${timestamp}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-headers')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    return fileName; // Return path, not URL
  } catch (error) {
    console.error('Error uploading header:', error);
    throw error;
  }
};

/**
 * Delete avatar from storage
 */
export const deleteAvatar = async (path) => {
  try {
    if (!path) return;

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([path]);

    if (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

/**
 * Delete header from storage
 */
export const deleteHeader = async (path) => {
  try {
    if (!path) return;

    const { error } = await supabase.storage
      .from('profile-headers')
      .remove([path]);

    if (error) {
      console.error('Error deleting header:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting header:', error);
    throw error;
  }
};

/**
 * Get public URL for avatar
 */
export const getAvatarUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Get public URL for header
 */
export const getHeaderUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage
    .from('profile-headers')
    .getPublicUrl(path);
  return data.publicUrl;
};

