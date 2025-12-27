/**
 * Albums Routes
 * REST API endpoints for albums and images management
 */

const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
// Use Supabase auth if available, fallback to JWT auth
let authenticateToken;
try {
  const supabaseAuth = require('../middleware/supabaseAuth');
  if (supabaseAuth && supabaseAuth.verifySupabaseToken) {
    authenticateToken = supabaseAuth.verifySupabaseToken;
  } else {
    authenticateToken = require('../middleware/auth').authenticateToken;
  }
} catch (e) {
  console.warn('Supabase auth middleware not available, using JWT auth:', e.message);
  authenticateToken = require('../middleware/auth').authenticateToken;
}

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Albums API is working!' });
});

// POST /albums - Create album
router.post('/', authenticateToken, albumController.createAlbum);

// GET /albums - Get all albums with cover images
router.get('/', albumController.getAlbums);

// POST /albums/:id/images - Upload image to album
router.post(
  '/:id/images',
  authenticateToken,
  albumController.upload.single('image'), // Multer middleware for file upload
  albumController.uploadImageToAlbum
);

// GET /albums/:id/images - Get all images of an album
router.get('/:id/images', albumController.getAlbumImages);

// PUT /albums/:id/cover - Set cover image for an album
router.put('/:id/cover', authenticateToken, albumController.setCoverImage);

// DELETE /albums/:id - Delete album (and all images via CASCADE)
router.delete('/:id', authenticateToken, albumController.deleteAlbum);

module.exports = router;

