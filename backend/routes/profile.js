const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/supabaseAuth');
const {
  getProfile,
  updateProfile,
  getUploadUrl
} = require('../controllers/profileController');

// All routes require authentication
router.use(verifySupabaseToken);

// GET /api/me/profile - Get current user's profile settings
router.get('/profile', getProfile);

// PUT /api/me/profile - Update profile settings
router.put('/profile', updateProfile);

// POST /api/me/profile/upload-url - Get signed upload URL
router.post('/profile/upload-url', getUploadUrl);

module.exports = router;








