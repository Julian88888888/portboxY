const { supabase } = require('../middleware/supabaseAuth');

/**
 * Get all bookings for current user
 * GET /api/bookings
 */
const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, job_type, dates, location, pay_rate, details, status } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        name: name.trim(),
        email: email.trim(),
        job_type: job_type || null,
        dates: dates || null,
        location: location || null,
        pay_rate: pay_rate || null,
        details: details || null,
        status: status || 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

/**
 * Update a booking
 * PUT /api/bookings/:id
 */
const updateBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { name, email, job_type, dates, location, pay_rate, details, status } = req.body;

    // Build update object
    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email cannot be empty'
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
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
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, accepted, rejected, completed'
        });
      }
      updateData.status = status || 'pending';
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .eq('user_id', userId) // Ensure user owns this booking
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

/**
 * Delete a booking
 * DELETE /api/bookings/:id
 */
const deleteBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId) // Ensure user owns this booking
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};

/**
 * Get messages for a booking
 * GET /api/bookings/:id/messages
 */
const getBookingMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { data: messages, error } = await supabase
      .from('booking_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: messages || []
    });
  } catch (error) {
    console.error('Error getting booking messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

/**
 * Send a message in a booking chat
 * POST /api/bookings/:id/messages
 */
const createBookingMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { body } = req.body || {};

    if (!body || !String(body).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message body is required'
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { data: message, error } = await supabase
      .from('booking_messages')
      .insert({
        booking_id: bookingId,
        sender_type: 'model',
        sender_id: userId,
        body: String(body).trim()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error creating booking message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingMessages,
  createBookingMessage
};
