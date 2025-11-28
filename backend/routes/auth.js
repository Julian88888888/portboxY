const express = require('express');
const multer = require('multer');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', validateRegistration, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "photos" as field name.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Photo upload routes
router.post('/upload-photos', authenticateToken, upload.array('photos', 10), handleMulterError, authController.uploadProfilePhotos);
router.delete('/photo/:photoId', authenticateToken, authController.deleteProfilePhoto);
router.put('/photo/:photoId/set-main', authenticateToken, authController.setMainPhoto);

module.exports = router; 