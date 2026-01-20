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
 * Get profile by username (public, no authentication required)
 */
export const getProfileByUsername = async (username) => {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required');
    }

    // Clean username (remove @ if present)
    const cleanedUsername = username.trim().replace(/^@+/, '');

    // Use direct REST API call with proper headers for public access
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/profiles?username=eq.${encodeURIComponent(cleanedUsername)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404 || response.status === 406) {
        // Profile not found or no data
        const text = await response.text();
        console.log('Profile not found response:', text);
        return null;
      }
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Supabase REST API returns an array, we need the first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile by username:', error);
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

    // List of allowed fields in profiles table
    const allowedFields = [
      'username',
      'display_name',
      'job_type',
      'description',
      'profile_photo_path',
      'profile_header_path',
      'header_photo_path', // Support both names for compatibility
      'show_profile_photo',
      'show_profile_header',
      'show_header_photo', // Support both names for compatibility
      'show_description'
    ];

    // Filter payload to only include allowed fields and handle field name mapping
    const cleanedPayload = {};
    
    for (const key in payload) {
      if (allowedFields.includes(key)) {
        let value = payload[key];
        
        // Handle field name mapping for compatibility
        if (key === 'header_photo_path') {
          cleanedPayload.profile_header_path = value || null;
          continue;
        } else if (key === 'show_header_photo') {
          cleanedPayload.show_profile_header = value;
          continue;
        }
        
        // Include all values (including empty strings and null for optional fields)
        // Only skip undefined values
        if (value !== undefined) {
          // Convert empty strings to null for optional text fields
          if (value === '' && (key === 'display_name' || key === 'description')) {
            cleanedPayload[key] = null;
          } else {
            cleanedPayload[key] = value;
          }
        }
      }
    }

    // Build final payload - include all non-undefined values
    const finalPayload = {
      ...cleanedPayload
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...finalPayload,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
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

