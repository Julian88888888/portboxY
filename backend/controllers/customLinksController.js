const { supabase } = require('../middleware/supabaseAuth');

/**
 * Get all custom links for current user
 * GET /api/custom-links
 */
const getCustomLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('custom_links')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error getting custom links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom links',
      error: error.message
    });
  }
};

/**
 * Create a new custom link
 * POST /api/custom-links
 */
const createCustomLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, url, icon_url, enabled } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Get current max display_order for this user
    const { data: existingLinks } = await supabase
      .from('custom_links')
      .select('display_order')
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingLinks && existingLinks.length > 0
      ? (existingLinks[0].display_order || 0) + 1
      : 0;

    const { data, error } = await supabase
      .from('custom_links')
      .insert({
        user_id: userId,
        title: title.trim(),
        url: url.trim(),
        icon_url: icon_url || null,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        display_order: nextOrder
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error creating custom link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom link',
      error: error.message
    });
  }
};

/**
 * Update a custom link
 * PUT /api/custom-links/:id
 */
const updateCustomLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const linkId = req.params.id;
    const { title, url, icon_url, enabled, display_order } = req.body;

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (url !== undefined) {
      if (!url || !url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'URL cannot be empty'
        });
      }
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
      updateData.url = url.trim();
    }

    if (icon_url !== undefined) {
      updateData.icon_url = icon_url || null;
    }

    if (enabled !== undefined) {
      updateData.enabled = Boolean(enabled);
    }

    if (display_order !== undefined) {
      updateData.display_order = parseInt(display_order, 10);
    }

    const { data, error } = await supabase
      .from('custom_links')
      .update(updateData)
      .eq('id', linkId)
      .eq('user_id', userId) // Ensure user owns this link
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Custom link not found'
        });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Custom link not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating custom link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom link',
      error: error.message
    });
  }
};

/**
 * Delete a custom link
 * DELETE /api/custom-links/:id
 */
const deleteCustomLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const linkId = req.params.id;

    const { data, error } = await supabase
      .from('custom_links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', userId) // Ensure user owns this link
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Custom link not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Custom link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom link',
      error: error.message
    });
  }
};

module.exports = {
  getCustomLinks,
  createCustomLink,
  updateCustomLink,
  deleteCustomLink
};


