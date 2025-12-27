/**
 * Album Controller
 * Handles album and image operations
 * 
 * Business Logic:
 * - One album → many images
 * - Image belongs to only one album
 * - Deleting album deletes all images (CASCADE)
 * - If cover image is deleted → choose next image as cover (handled by DB trigger)
 * - If album has no cover → set uploaded image as cover (handled by DB trigger)
 */

const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Initialize Supabase client
// In production, use environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// For local file storage (fallback if Supabase not configured)
const UPLOAD_DIR = path.join(__dirname, '../uploads/albums');
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

// Configure multer for file uploads (local storage fallback)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Initialize Supabase client if credentials are available
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized for albums API');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️  Supabase not configured for albums API. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  console.warn('   Current values:', {
    SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'SET' : 'NOT SET',
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
  });
}

/**
 * Upload image to storage
 * Returns URL of uploaded image
 */
const uploadImageToStorage = async (file) => {
  // If Supabase is configured, use it
  if (supabase) {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `albums/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
      
      const fileBuffer = await fs.readFile(file.path);
      
      const { data, error } = await supabase.storage
        .from('profile-photos') // Using existing bucket, or create 'albums' bucket
        .upload(fileName, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Clean up local file
      await fs.unlink(file.path).catch(() => {});

      return publicUrl;
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      // Fallback to local storage
    }
  }

  // Fallback: return local file URL
  // file.path is something like: /app/uploads/albums/filename.png
  // We need: /uploads/albums/filename.png
  const projectRoot = path.join(__dirname, '../');
  const relativePath = path.relative(projectRoot, file.path);
  // Normalize path separators
  let cleanPath = relativePath.replace(/\\/g, '/');
  // Remove any leading 'uploads/' if already present to avoid duplication
  cleanPath = cleanPath.replace(/^uploads[\/\\]/, '');
  // Ensure we have a clean /uploads/albums/... path
  if (!cleanPath.startsWith('albums/')) {
    // If path doesn't start with albums/, add it
    const fileName = path.basename(cleanPath);
    cleanPath = `albums/${fileName}`;
  }
  return `/uploads/${cleanPath}`;
};

/**
 * POST /albums
 * Create a new album
 */
const createAlbum = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // If using Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('albums')
          .insert({
            title: title.trim(),
            description: description ? description.trim() : null,
            cover_image_id: null
          })
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            error: error.message || 'Failed to create album',
            details: error.details || null
          });
        }

        return res.status(201).json({
          success: true,
          data: {
            id: data.id,
            title: data.title,
            description: data.description,
            cover_image_id: data.cover_image_id,
            cover_image_url: null,
            created_at: data.created_at
          }
        });
      } catch (dbError) {
        console.error('Supabase connection error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database connection error. Please check Supabase configuration.',
          details: dbError.message
        });
      }
    }

    // Fallback: mock response (for development without Supabase)
    console.warn('Supabase not configured, returning mock response');
    res.status(201).json({
      success: true,
      data: {
        id: 'mock-id-' + Date.now(),
        title: title.trim(),
        description: description ? description.trim() : null,
        cover_image_id: null,
        cover_image_url: null,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Create album error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * GET /albums
 * Get all albums with cover images
 */
const getAlbums = async (req, res) => {
  try {
    if (supabase) {
      // Get all albums
      const { data: albums, error } = await supabase
        .from('albums')
        .select('id, title, description, cover_image_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Failed to fetch albums'
        });
      }

      // Get cover image URLs for albums that have covers
      const coverImageIds = albums
        .filter(album => album.cover_image_id)
        .map(album => album.cover_image_id);

      let coverImagesMap = {};
      if (coverImageIds.length > 0) {
        const { data: coverImages, error: imagesError } = await supabase
          .from('images')
          .select('id, url')
          .in('id', coverImageIds);

        if (!imagesError && coverImages) {
          coverImagesMap = coverImages.reduce((acc, img) => {
            acc[img.id] = img.url;
            return acc;
          }, {});
        }
      }

      // Format response with cover image URLs
      const formattedAlbums = albums.map(album => ({
        id: album.id,
        title: album.title,
        description: album.description,
        cover_image_id: album.cover_image_id,
        cover_image_url: album.cover_image_id ? coverImagesMap[album.cover_image_id] || null : null,
        created_at: album.created_at
      }));

      return res.json({
        success: true,
        data: formattedAlbums
      });
    }

    // Fallback: mock response
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * POST /albums/:id/images
 * Upload image and attach to album
 * If album has no cover → set uploaded image as cover (handled by DB trigger)
 */
const uploadImageToAlbum = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Upload image to storage
    const imageUrl = await uploadImageToStorage(req.file);

    if (supabase) {
      // Check if album exists
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id, cover_image_id')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Insert image
      const { data: image, error: imageError } = await supabase
        .from('images')
        .insert({
          album_id: albumId,
          url: imageUrl
        })
        .select()
        .single();

      if (imageError) {
        console.error('Database error:', imageError);
        return res.status(500).json({
          success: false,
          error: imageError.message || 'Failed to save image'
        });
      }

      // Check if cover was automatically set (by trigger)
      const { data: updatedAlbum } = await supabase
        .from('albums')
        .select('cover_image_id')
        .eq('id', albumId)
        .single();

      return res.status(201).json({
        success: true,
        data: {
          id: image.id,
          album_id: image.album_id,
          url: image.url,
          is_cover: updatedAlbum.cover_image_id === image.id,
          created_at: image.created_at
        }
      });
    }

    // Fallback: mock response
    res.status(201).json({
      success: true,
      data: {
        id: 'mock-image-id-' + Date.now(),
        album_id: albumId,
        url: imageUrl,
        is_cover: false,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * GET /albums/:id/images
 * Get all images of an album
 */
const getAlbumImages = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    if (supabase) {
      // Check if album exists
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Get all images for this album
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('id, album_id, url, created_at')
        .eq('album_id', albumId)
        .order('created_at', { ascending: true });

      if (imagesError) {
        console.error('Database error:', imagesError);
        return res.status(500).json({
          success: false,
          error: imagesError.message || 'Failed to fetch images'
        });
      }

      return res.json({
        success: true,
        data: images
      });
    }

    // Fallback: mock response
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get album images error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * PUT /albums/:id/cover
 * Set cover image for an album
 */
const setCoverImage = async (req, res) => {
  try {
    const { id: albumId } = req.params;
    const { image_id: imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'image_id is required'
      });
    }

    if (supabase) {
      // Verify album exists
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Verify image exists and belongs to this album
      const { data: image, error: imageError } = await supabase
        .from('images')
        .select('id, album_id')
        .eq('id', imageId)
        .eq('album_id', albumId)
        .single();

      if (imageError || !image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found or does not belong to this album'
        });
      }

      // Update album cover
      const { data: updatedAlbum, error: updateError } = await supabase
        .from('albums')
        .update({ cover_image_id: imageId })
        .eq('id', albumId)
        .select()
        .single();

      if (updateError) {
        console.error('Database error:', updateError);
        return res.status(500).json({
          success: false,
          error: updateError.message || 'Failed to set cover image'
        });
      }

      return res.json({
        success: true,
        data: updatedAlbum,
        message: 'Cover image updated successfully'
      });
    }

    // Fallback: mock response
    res.json({
      success: true,
      message: 'Cover image updated (mock)'
    });
  } catch (error) {
    console.error('Set cover image error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * DELETE /images/:id
 * Delete an image
 * If cover image is deleted → choose next image as cover (handled by DB trigger)
 */
const deleteImage = async (req, res) => {
  try {
    const { id: imageId } = req.params;

    if (supabase) {
      // Get image info before deletion
      const { data: image, error: imageError } = await supabase
        .from('images')
        .select('id, album_id, url')
        .eq('id', imageId)
        .single();

      if (imageError || !image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      // Delete image from database (CASCADE will handle album cover update via trigger)
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (deleteError) {
        console.error('Database error:', deleteError);
        return res.status(500).json({
          success: false,
          error: deleteError.message || 'Failed to delete image'
        });
      }

      // Optionally: Delete file from storage
      // This would require parsing the URL and deleting from Supabase Storage
      // For now, we'll leave the file (you can implement cleanup later)

      return res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    }

    // Fallback: mock response
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * DELETE /albums/:id
 * Delete an album (and all its images via CASCADE)
 */
const deleteAlbum = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    if (supabase) {
      // Check if album exists
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Delete album (CASCADE will delete all images)
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (deleteError) {
        console.error('Database error:', deleteError);
        return res.status(500).json({
          success: false,
          error: deleteError.message || 'Failed to delete album'
        });
      }

      return res.json({
        success: true,
        message: 'Album and all its images deleted successfully'
      });
    }

    // Fallback: mock response
    res.json({
      success: true,
      message: 'Album deleted successfully'
    });

  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  uploadImageToAlbum,
  getAlbumImages,
  setCoverImage,
  deleteImage,
  deleteAlbum,
  upload // Export multer middleware
};

