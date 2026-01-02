const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/supabaseAuth');
const {
  getCustomLinks,
  createCustomLink,
  updateCustomLink,
  deleteCustomLink
} = require('../controllers/customLinksController');

// All routes require authentication
router.use(verifySupabaseToken);

// GET /api/custom-links - Get all custom links for current user
router.get('/', getCustomLinks);

// POST /api/custom-links - Create a new custom link
router.post('/', createCustomLink);

// PUT /api/custom-links/:id - Update a custom link
router.put('/:id', updateCustomLink);

// DELETE /api/custom-links/:id - Delete a custom link
router.delete('/:id', deleteCustomLink);

module.exports = router;

