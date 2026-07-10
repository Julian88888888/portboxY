const express = require('express');
const router = express.Router();
const { verifySupabaseToken } = require('../middleware/supabaseAuth');
const {
  getCustomLinks,
  createCustomLink,
  updateCustomLink,
  deleteCustomLink
} = require('../controllers/customLinksController');

// GET is public when ?userId= is provided; otherwise requires auth
router.get('/', (req, res, next) => {
  if (req.query.userId) {
    return getCustomLinks(req, res, next);
  }
  return verifySupabaseToken(req, res, () => getCustomLinks(req, res, next));
});

// Mutations require authentication
router.post('/', verifySupabaseToken, createCustomLink);
router.put('/:id', verifySupabaseToken, updateCustomLink);
router.delete('/:id', verifySupabaseToken, deleteCustomLink);

module.exports = router;


