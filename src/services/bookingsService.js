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
 * Get auth headers with Supabase token
 */
const getAuthHeaders = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Bookings: Error getting session:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
    
    const session = data?.session;
    
    if (!session) {
      console.warn('Bookings: No session found - user may not be logged in');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    const token = session?.access_token;
    
    if (!token) {
      console.warn('Bookings: No access token found in session');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Bookings: Error in getAuthHeaders:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

/**
 * Guest (client): get messages - no auth, email required
 */
export const getGuestBookingMessages = async (bookingId, email) => {
  try {
    const params = new URLSearchParams({ email: (email || '').trim() });
    const response = await fetch(
      `${getApiBaseUrl()}/bookings/${bookingId}/guest-messages?${params}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Failed to get messages' };
    }
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Error getting guest messages:', error);
    return { success: false, error: error.message || 'Failed to get messages' };
  }
};

/**
 * Guest (client): send message - no auth, email required
 */
export const sendGuestBookingMessage = async (bookingId, email, body) => {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/bookings/${bookingId}/guest-messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: (email || '').trim(), body: String(body).trim() })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Failed to send message' };
    }
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error sending guest message:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
};

/**
 * Get messages for a booking (chat) - for logged-in model
 */
export const getBookingMessages = async (bookingId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/bookings/${bookingId}/messages`, {
      method: 'GET',
      headers
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to get messages'
      };
    }
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error getting booking messages:', error);
    return {
      success: false,
      error: error.message || 'Failed to get messages'
    };
  }
};

/**
 * Send a message in a booking chat
 */
export const sendBookingMessage = async (bookingId, body) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: String(body).trim() })
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to send message'
      };
    }
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error sending booking message:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message'
    };
  }
};

/**
 * Get all bookings for the current user
 */
export const getBookings = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiBaseUrl()}/bookings`, {
      method: 'GET',
      headers
    });

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      console.warn('Bookings: 429 Too Many Requests - Rate limit exceeded');
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        rateLimited: true
      };
    }

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Bookings: 401 Unauthorized - Token may be missing or invalid');
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }
      return {
        success: false,
        error: data.message || data.error || 'Failed to get bookings'
      };
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error getting bookings:', error);
    return {
      success: false,
      error: error.message || 'Failed to get bookings'
    };
  }
};

/**
 * Create a booking as guest (no auth) - for public model page "Book me"
 * modelIdentifier: { modelId } or { username }
 */
export const createGuestBooking = async (bookingData, modelIdentifier) => {
  try {
    const { name, email, job_type, dates, location, pay_rate, details, status } = bookingData;
    const { modelId, username } = modelIdentifier || {};

    if (!name || !name.trim()) {
      return { success: false, error: 'Name is required' };
    }
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: 'Invalid email format' };
    }
    if (!modelId && !username) {
      return { success: false, error: 'Model is required' };
    }

    const response = await fetch(`${getApiBaseUrl()}/bookings/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: modelId || undefined,
        username: username || undefined,
        name: name.trim(),
        email: email.trim(),
        job_type: job_type || null,
        dates: dates || null,
        location: location || null,
        pay_rate: pay_rate || null,
        details: details || null,
        status: status || 'pending'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to create booking'
      };
    }
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error creating guest booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to create booking'
    };
  }
};

/**
 * Create a new booking (logged-in user)
 */
export const createBooking = async (bookingData) => {
  try {
    const { name, email, job_type, dates, location, pay_rate, details, status } = bookingData;

    if (!name || !name.trim()) {
      return {
        success: false,
        error: 'Name is required'
      };
    }

    if (!email || !email.trim()) {
      return {
        success: false,
        error: 'Email is required'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        job_type: job_type || null,
        dates: dates || null,
        location: location || null,
        pay_rate: pay_rate || null,
        details: details || null,
        status: status || 'pending'
      })
    });

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      console.warn('Bookings: 429 Too Many Requests - Rate limit exceeded');
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        rateLimited: true
      };
    }

    // Parse response body
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        const text = await response.text();
        console.error('Response text:', text);
        return {
          success: false,
          error: `Server error: Failed to parse response (Status: ${response.status})`,
          rawResponse: text
        };
      }
    } else {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      return {
        success: false,
        error: `Server error: Invalid response format (Status: ${response.status})`,
        rawResponse: text
      };
    }
    
    if (!response.ok) {
      // Check for RLS error specifically
      if (data.code === '42501') {
        return {
          success: false,
          error: data.details || data.hint || 'Row Level Security policy violation. Please contact administrator.',
          rlsError: true
        };
      }
      
      return {
        success: false,
        error: data.message || data.error || `Failed to create booking (Status: ${response.status})`,
        code: data.code,
        details: data.details
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to create booking'
    };
  }
};

/**
 * Update a booking
 */
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const { name, email, job_type, dates, location, pay_rate, details, status } = bookingData;

    const updateData = {};
    
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return {
          success: false,
          error: 'Name cannot be empty'
        };
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || !email.trim()) {
        return {
          success: false,
          error: 'Email cannot be empty'
        };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }
      updateData.email = email.trim();
    }

    if (job_type !== undefined) updateData.job_type = job_type || null;
    if (dates !== undefined) updateData.dates = dates || null;
    if (location !== undefined) updateData.location = location || null;
    if (pay_rate !== undefined) updateData.pay_rate = pay_rate || null;
    if (details !== undefined) updateData.details = details || null;
    if (status !== undefined) {
      if (status && !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
        return {
          success: false,
          error: 'Invalid status. Must be one of: pending, accepted, rejected, completed'
        };
      }
      updateData.status = status || 'pending';
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/bookings/${bookingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to update booking'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to update booking'
    };
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (bookingId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to delete booking'
      };
    }

    return {
      success: true,
      message: data.message || 'Booking deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete booking'
    };
  }
};
