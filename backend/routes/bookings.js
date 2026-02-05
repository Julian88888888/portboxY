const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/supabaseAuth');
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingsController');

// All routes require authentication
router.use(verifySupabaseToken);

// GET /api/bookings - Get all bookings for current user
router.get('/', getBookings);

// POST /api/bookings - Create a new booking
router.post('/', createBooking);

// PUT /api/bookings/:id - Update a booking
router.put('/:id', updateBooking);

// DELETE /api/bookings/:id - Delete a booking
router.delete('/:id', deleteBooking);

module.exports = router;
