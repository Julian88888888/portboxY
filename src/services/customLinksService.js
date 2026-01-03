import supabase from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

/**
 * Get auth headers with Supabase token
 */
const getAuthHeaders = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('CustomLinks: Error getting session:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
    
    const session = data?.session;
    
    if (!session) {
      console.warn('CustomLinks: No session found - user may not be logged in');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    const token = session?.access_token;
    
    if (!token) {
      console.warn('CustomLinks: No access token found in session');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    // Log token info (first/last 10 chars for debugging, not full token)
    const tokenPreview = token.length > 20 
      ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
      : 'short';
    console.log('CustomLinks: Token found, length:', token.length, 'preview:', tokenPreview);
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('CustomLinks: Error in getAuthHeaders:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

/**
 * Get all custom links for the current user
 */
export const getCustomLinks = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/custom-links`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('CustomLinks: 401 Unauthorized - Token may be missing or invalid');
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }
      return {
        success: false,
        error: data.message || data.error || 'Failed to get custom links'
      };
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error getting custom links:', error);
    return {
      success: false,
      error: error.message || 'Failed to get custom links'
    };
  }
};

/**
 * Create a new custom link
 */
export const createCustomLink = async (linkData) => {
  try {
    const { title, url, icon_url, enabled } = linkData;

    if (!title || !title.trim()) {
      return {
        success: false,
        error: 'Title is required'
      };
    }

    if (!url || !url.trim()) {
      return {
        success: false,
        error: 'URL is required'
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        error: 'Invalid URL format'
      };
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/custom-links`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: title.trim(),
        url: url.trim(),
        icon_url: icon_url || null,
        enabled: enabled !== undefined ? enabled : true
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to create custom link'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error creating custom link:', error);
    return {
      success: false,
      error: error.message || 'Failed to create custom link'
    };
  }
};

/**
 * Update a custom link
 */
export const updateCustomLink = async (linkId, linkData) => {
  try {
    const { title, url, icon_url, enabled, display_order } = linkData;

    const updateData = {};
    
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return {
          success: false,
          error: 'Title cannot be empty'
        };
      }
      updateData.title = title.trim();
    }

    if (url !== undefined) {
      if (!url || !url.trim()) {
        return {
          success: false,
          error: 'URL cannot be empty'
        };
      }
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }
      updateData.url = url.trim();
    }

    if (icon_url !== undefined) {
      updateData.icon_url = icon_url || null;
    }

    if (enabled !== undefined) {
      updateData.enabled = Boolean(enabled);
    }

    if (display_order !== undefined) {
      updateData.display_order = parseInt(display_order, 10);
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/custom-links/${linkId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to update custom link'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error updating custom link:', error);
    return {
      success: false,
      error: error.message || 'Failed to update custom link'
    };
  }
};

/**
 * Delete a custom link
 */
export const deleteCustomLink = async (linkId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/custom-links/${linkId}`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to delete custom link'
      };
    }

    return {
      success: true,
      message: data.message || 'Custom link deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting custom link:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete custom link'
    };
  }
};

