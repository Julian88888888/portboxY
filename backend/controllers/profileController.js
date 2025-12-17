const { supabase } = require('../middleware/supabaseAuth');

/**
 * Get current user's profile settings
 * GET /api/me/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, return default values
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          data: {
            id: userId,
            profile_photo_path: null,
            profile_header_path: null,
            show_profile_photo: true,
            show_profile_header: true,
            updated_at: new Date().toISOString()
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

/**
 * Update current user's profile settings
 * PUT /api/me/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      profile_photo_path, 
      profile_header_path, 
      show_profile_photo, 
      show_profile_header 
    } = req.body;

    // Build update object with only provided fields
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (profile_photo_path !== undefined) {
      updateData.profile_photo_path = profile_photo_path;
    }
    if (profile_header_path !== undefined) {
      updateData.profile_header_path = profile_header_path;
    }
    if (show_profile_photo !== undefined) {
      updateData.show_profile_photo = Boolean(show_profile_photo);
    }
    if (show_profile_header !== undefined) {
      updateData.show_profile_header = Boolean(show_profile_header);
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updateData
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get signed upload URL for profile photo or header
 * POST /api/me/profile/upload-url
 * Body: { type: 'profile_photo' | 'profile_header', fileName: string }
 */
const getUploadUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, fileName } = req.body;

    if (!type || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'type and fileName are required'
      });
    }

    if (type !== 'profile_photo' && type !== 'profile_header') {
      return res.status(400).json({
        success: false,
        message: 'type must be either "profile_photo" or "profile_header"'
      });
    }

    // Determine bucket based on type
    const bucket = type === 'profile_photo' ? 'profile-photos' : 'profile-headers';
    
    // Generate file path: ${userId}/${type}/${timestamp}-${originalName}
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${type}/${timestamp}-${sanitizedFileName}`;

    // Generate signed URL for upload (valid for 1 hour = 3600 seconds)
    // Note: Supabase signed URLs can be used for PUT requests to upload files
    // The signed URL allows the client to upload directly to storage
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      throw urlError;
    }

    res.json({
      success: true,
      data: {
        uploadUrl: urlData.signedUrl,
        path: filePath,
        expiresIn: 3600
      }
    });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload URL',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUploadUrl
};

