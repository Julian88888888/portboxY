import apiService from './api';

// Auto-detect API URL based on environment
const getApiBaseUrl = (): string => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (Vercel), use the same domain
  if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  
  // Default to localhost for development
  return 'http://localhost:5002/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ProfileSettings {
  id: string;
  profile_photo_path: string | null;
  profile_header_path: string | null;
  show_profile_photo: boolean;
  show_profile_header: boolean;
  updated_at: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  path: string;
}

/**
 * Get current user's profile settings
 */
export const getProfileSettings = async (): Promise<ProfileSettings> => {
  const headers = await apiService.getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/me/profile`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get profile settings');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Update profile settings
 */
export const updateProfileSettings = async (
  updates: Partial<ProfileSettings>
): Promise<ProfileSettings> => {
  const headers = await apiService.getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/me/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile settings');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get signed upload URL for profile photo or header
 */
export const getUploadUrl = async (
  type: 'profile_photo' | 'profile_header',
  fileName: string
): Promise<UploadUrlResponse> => {
  const headers = await apiService.getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/me/profile/upload-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type, fileName })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get upload URL');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Upload file to signed URL
 * Note: Supabase signed URLs work with PUT method
 */
export const uploadFileToUrl = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'x-upsert': 'false' // Don't overwrite existing files
    },
    body: file
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file: ${errorText || response.statusText}`);
  }
};

