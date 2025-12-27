/**
 * Images Routes
 * REST API endpoints for image management
 */

const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
// Use Supabase auth if available, fallback to JWT auth
let authenticateToken;
try {
  const supabaseAuth = require('../middleware/supabaseAuth');
  authenticateToken = supabaseAuth.verifySupabaseToken || require('../middleware/auth').authenticateToken;
} catch (e) {
  authenticateToken = require('../middleware/auth').authenticateToken;
}

// DELETE /images/:id - Delete image
router.delete('/:id', authenticateToken, albumController.deleteImage);

module.exports = router;

