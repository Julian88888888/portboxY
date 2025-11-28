const Portfolio = require('../models/Portfolio');

// Create a new portfolio
const createPortfolio = async (req, res) => {
  try {
    const { title, description, isPublic = true, images = [] } = req.body;
    
    const portfolio = new Portfolio({
      userId: req.user.id,
      title,
      description,
      isPublic,
      images
    });

    await portfolio.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });

  } catch (error) {
    console.error('Create portfolio error:', error);
    
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

// Get user's portfolios
const getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: portfolios
    });

  } catch (error) {
    console.error('Get user portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get public portfolios
const getPublicPortfolios = async (req, res) => {
  try {
    const { userType, limit = 10, page = 1 } = req.query;
    
    const query = { isPublic: true };
    if (userType) {
      query['user.userType'] = userType;
    }

    const portfolios = await Portfolio.find(query)
      .populate('user', 'firstName lastName userType profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Portfolio.countDocuments(query);

    res.json({
      success: true,
      data: {
        portfolios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get public portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single portfolio
const getPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const portfolio = await Portfolio.findById(id)
      .populate('user', 'firstName lastName userType profileImage bio');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check if user can access this portfolio
    if (!portfolio.isPublic && portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: portfolio
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update portfolio
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic, images } = req.body;

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check ownership
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (images !== undefined) updateData.images = images;

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: updatedPortfolio
    });

  } catch (error) {
    console.error('Update portfolio error:', error);
    
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

// Delete portfolio
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check ownership
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Portfolio.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createPortfolio,
  getUserPortfolios,
  getPublicPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio
}; 