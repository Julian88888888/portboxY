const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// User registration
// User registration
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType = 'model' } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: firstName, lastName, email, phone, password'
      });
    }

    if (password.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 1 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      userType
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, userType } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (userType !== undefined) updateData.userType = userType;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await User.hashPassword(newPassword);

    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload profile photos
const uploadProfilePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const uploadedPhotos = [];
    const currentPhotoCount = user.profilePhotos.length;
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const photoData = {
        url: `/uploads/profile-photos/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        isMain: currentPhotoCount === 0 && i === 0 // First photo becomes main only if no existing photos
      };
      
      uploadedPhotos.push(photoData);
    }

    // Add new photos to user's profilePhotos array
    user.profilePhotos.push(...uploadedPhotos);
    await user.save();

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        uploadedPhotos,
        totalPhotos: user.profilePhotos.length
      }
    });

  } catch (error) {
    console.error('Upload photos error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during photo upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const photoIndex = user.profilePhotos.findIndex(photo => photo._id.toString() === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photo = user.profilePhotos[photoIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads/profile-photos', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove photo from array
    user.profilePhotos.splice(photoIndex, 1);
    
    // If deleted photo was main, make first remaining photo main
    if (photo.isMain && user.profilePhotos.length > 0) {
      user.profilePhotos[0].isMain = true;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        remainingPhotos: user.profilePhotos.length
      }
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during photo deletion'
    });
  }
};

// Set main profile photo
const setMainPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const photoIndex = user.profilePhotos.findIndex(photo => photo._id.toString() === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Remove main flag from all photos
    user.profilePhotos.forEach(photo => {
      photo.isMain = false;
    });

    // Set selected photo as main
    user.profilePhotos[photoIndex].isMain = true;
    
    await user.save();

    res.json({
      success: true,
      message: 'Main photo updated successfully'
    });

  } catch (error) {
    console.error('Set main photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePhotos,
  deleteProfilePhoto,
  setMainPhoto
}; 