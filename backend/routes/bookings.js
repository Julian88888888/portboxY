const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/supabaseAuth');
const {
  getBookings,
  getBookingsAsClient,
  createBooking,
  createGuestBooking,
  updateBooking,
  deleteBooking,
  getBookingMessages,
  createBookingMessage,
  getGuestBookingMessages,
  createGuestBookingMessage
} = require('../controllers/bookingsController');

// Guest create booking (no auth) - for public model page "Book me"
router.post('/guest', createGuestBooking);

// Guest chat (no auth) - validate by email
router.get('/:id/guest-messages', getGuestBookingMessages);
router.post('/:id/guest-messages', createGuestBookingMessage);

// All routes below require authentication
router.use(verifySupabaseToken);

// GET /api/bookings - Get all bookings for current user (as model)
router.get('/', getBookings);
// GET /api/bookings/as-client - Bookings where current user is the client
router.get('/as-client', getBookingsAsClient);

// POST /api/bookings - Create a new booking (logged-in user)
router.post('/', createBooking);

// GET /api/bookings/:id/messages - Get messages for a booking
router.get('/:id/messages', getBookingMessages);

// POST /api/bookings/:id/messages - Send a message in a booking chat
router.post('/:id/messages', createBookingMessage);

// PUT /api/bookings/:id - Update a booking
router.put('/:id', updateBooking);

// DELETE /api/bookings/:id - Delete a booking
router.delete('/:id', deleteBooking);

module.exports = router;
