const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/public', portfolioController.getPublicPortfolios);
router.get('/:id', portfolioController.getPortfolio);

// Protected routes
router.post('/', authenticateToken, portfolioController.createPortfolio);
router.get('/user/portfolios', authenticateToken, portfolioController.getUserPortfolios);
router.put('/:id', authenticateToken, portfolioController.updatePortfolio);
router.delete('/:id', authenticateToken, portfolioController.deletePortfolio);

module.exports = router; 