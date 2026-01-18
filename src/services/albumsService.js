/**
 * Albums Service
 * Handles API calls for albums and images management
 */

import supabase from './supabase';

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
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

/**
 * Normalize image URL
 * Converts relative URLs to absolute URLs using the backend server
 * If URL is already absolute (starts with http:// or https://), returns as is
 * Fixes duplicate /uploads/uploads/ paths
 */
export const normalizeImageUrl = (url) => {
  if (!url) return null;
  
  // If already absolute URL (Supabase or external), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Fix duplicate /uploads/uploads/ paths
  let cleanUrl = url.replace(/\/uploads\/uploads\//g, '/uploads/');
  
  // If relative URL starting with /uploads, convert to absolute using backend
  if (cleanUrl.startsWith('/uploads/')) {
    const apiBaseUrl = getApiBaseUrl();
    // If API base URL is already a full URL (production), use it
    if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
      const backendBaseUrl = apiBaseUrl.replace('/api', '');
      return `${backendBaseUrl}${cleanUrl}`;
    }
    // For localhost, use as is
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return `${backendBaseUrl}${cleanUrl}`;
  }
  
  // If relative URL without leading slash, assume it's relative to backend
  if (!cleanUrl.startsWith('/')) {
    const apiBaseUrl = getApiBaseUrl();
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return `${backendBaseUrl}/uploads/${cleanUrl}`;
  }
  
  // Default: return as is (but still fix duplicates)
  return cleanUrl;
};

/**
 * Get authentication headers with Supabase token
 */
const getAuthHeaders = async () => {
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
};

/**
 * POST /albums
 * Create a new album
 * 
 * @param {Object} albumData - Album data
 * @param {string} albumData.title - Album title (required)
 * @param {string} albumData.description - Album description (optional)
 * @returns {Promise<Object>} Created album
 */
export const createAlbum = async (albumData) => {
  try {
    const { title, description } = albumData;

    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiBaseUrl()}/albums`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        title: title.trim(),
        description: description ? description.trim() : null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create album');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error creating album:', error);
    return {
      success: false,
      error: error.message || 'Failed to create album'
    };
  }
};

/**
 * GET /albums
 * Get all albums with cover images
 * 
 * @returns {Promise<Array>} Array of albums
 */
export const getAlbums = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/albums`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch albums');
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching albums:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch albums',
      data: []
    };
  }
};

/**
 * POST /albums/:id/images
 * Upload image and attach to album
 * If album has no cover → set uploaded image as cover (handled by backend)
 * 
 * @param {string} albumId - Album ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Uploaded image data
 */
export const uploadImageToAlbum = async (albumId, imageFile) => {
  try {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Only image files are allowed (JPG, PNG, GIF, WebP)');
    }

    // Validate file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image size must be less than 10MB');
    }

    const headers = await getAuthHeaders();
    // Remove Content-Type for FormData (browser will set it with boundary)
    delete headers['Content-Type'];

    const formData = new FormData();
    formData.append('image', imageFile);

    // Add albumId to URL as query parameter for Vercel compatibility
    // Vercel may have issues with nested dynamic routes, so we pass it in query too
    const response = await fetch(`${getApiBaseUrl()}/albums/${albumId}/images?albumId=${encodeURIComponent(albumId)}`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
};

/**
 * GET /albums/:id/images
 * Get all images of an album
 * 
 * @param {string} albumId - Album ID
 * @returns {Promise<Array>} Array of images
 */
export const getAlbumImages = async (albumId) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/albums/${albumId}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch images');
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching album images:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch images',
      data: []
    };
  }
};

/**
 * PUT /albums/:id/cover
 * Set cover image for an album
 * 
 * @param {string} albumId - Album ID
 * @param {string} imageId - Image ID to set as cover
 * @returns {Promise<Object>} Success status
 */
export const setCoverImage = async (albumId, imageId) => {
  try {
    if (!albumId || !imageId) {
      throw new Error('Album ID and Image ID are required');
    }

    const headers = await getAuthHeaders();

    const response = await fetch(`${getApiBaseUrl()}/albums/${albumId}/cover`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        image_id: imageId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to set cover image');
    }

    return {
      success: true,
      message: data.message || 'Cover image updated successfully'
    };
  } catch (error) {
    console.error('Error setting cover image:', error);
    return {
      success: false,
      error: error.message || 'Failed to set cover image'
    };
  }
};

/**
 * DELETE /images/:id
 * Delete an image
 * If cover image is deleted → choose next image as cover (handled by backend)
 * 
 * @param {string} imageId - Image ID
 * @returns {Promise<Object>} Success status
 */
export const deleteImage = async (imageId) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${getApiBaseUrl()}/images/${imageId}`, {
      method: 'DELETE',
      headers: headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete image');
    }

    return {
      success: true,
      message: data.message || 'Image deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete image'
    };
  }
};

/**
 * DELETE /albums/:id
 * Delete an album (and all its images via CASCADE)
 * 
 * @param {string} albumId - Album ID
 * @returns {Promise<Object>} Success status
 */
export const deleteAlbum = async (albumId) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${getApiBaseUrl()}/albums/${albumId}`, {
      method: 'DELETE',
      headers: headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete album');
    }

    return {
      success: true,
      message: data.message || 'Album deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting album:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete album'
    };
  }
};

