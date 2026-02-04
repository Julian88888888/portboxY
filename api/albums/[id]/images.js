/**
 * Vercel Serverless Function for uploading images to albums
 * Handles POST /api/albums/:id/images
 */

const { createClient } = require('@supabase/supabase-js');
const busboy = require('busboy');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Verify Supabase token from Authorization header
 */
async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { error: 'Access token required', user: null };
  }

  if (!supabase) {
    return { error: 'Supabase not configured', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { error: 'Invalid or expired token', user: null };
    }
    return { error: null, user };
  } catch (error) {
    return { error: 'Token verification failed', user: null };
  }
}

/**
 * Parse multipart/form-data and extract file
 */
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });
    const fileData = {
      buffer: null,
      filename: null,
      mimetype: null
    };
    let fileFound = false;

    bb.on('file', (name, file, info) => {
      if (name === 'image') {
        fileFound = true;
        const { filename, encoding, mimeType } = info;
        fileData.filename = filename;
        fileData.mimetype = mimeType;
        
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          fileData.buffer = Buffer.concat(chunks);
        });
      } else {
        // Skip other fields
        file.resume();
      }
    });

    bb.on('finish', () => {
      if (!fileFound) {
        reject(new Error('No image file found in form data. Make sure the field name is "image".'));
      } else {
        resolve(fileData);
      }
    });

    bb.on('error', (error) => {
      reject(error);
    });

    // Handle the request stream
    // In Vercel, req is a readable stream
    if (req.readable || typeof req.pipe === 'function') {
      req.pipe(bb);
    } else if (req.body) {
      // Fallback: if body is already available
      bb.end(Buffer.from(req.body));
    } else {
      reject(new Error('Request body is not readable'));
    }
  });
}

/**
 * Upload image to Supabase Storage
 */
async function uploadToSupabaseStorage(fileBuffer, fileName, mimetype) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const fileExt = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `albums/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('profile-photos') // Using existing bucket
    .upload(uniqueFileName, fileBuffer, {
      contentType: mimetype,
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
    .getPublicUrl(uniqueFileName);

  return publicUrl;
}

/**
 * Main handler for Vercel Serverless Function
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
  }

  try {
    // GET /api/albums/:id/images - Get all images of an album
    if (req.method === 'GET') {
      // Get album ID from URL
      let albumId = req.query.id || req.query.albumId;
      
      // If not in query, parse from URL path
      if (!albumId) {
        const urlParts = req.url.split('/').filter(Boolean);
        const albumsIndex = urlParts.indexOf('albums');
        if (albumsIndex >= 0 && albumsIndex < urlParts.length - 1) {
          albumId = urlParts[albumsIndex + 1];
        }
      }

      if (!albumId) {
        return res.status(400).json({
          success: false,
          error: 'Album ID is required'
        });
      }

      // Get all images for the album
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('id, album_id, url, created_at')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (imagesError) {
        console.error('Database error:', imagesError);
        return res.status(500).json({
          success: false,
          error: imagesError.message || 'Failed to fetch images'
        });
      }

      return res.status(200).json({
        success: true,
        data: images || []
      });
    }

    // POST /api/albums/:id/images - Upload image to album
    if (req.method === 'POST') {
      // Verify authentication
      const { error: authError, user } = await verifyToken(req);
      if (authError || !user) {
        return res.status(401).json({
          success: false,
          error: authError || 'Unauthorized'
        });
      }

      // Get album ID from URL
    // In Vercel, for nested dynamic routes like /api/albums/[id]/images.js
    // The [id] parameter is available in req.query.id
    // Also check query parameter albumId as fallback
    let albumId = req.query.id || req.query.albumId;
    
    // If not in query, parse from URL path
    if (!albumId) {
      const urlParts = req.url.split('/').filter(Boolean);
      // Expected: ['api', 'albums', 'album-id', 'images']
      const albumsIndex = urlParts.indexOf('albums');
      if (albumsIndex >= 0 && albumsIndex < urlParts.length - 1) {
        albumId = urlParts[albumsIndex + 1];
      }
    }
    
    // Log for debugging
    console.log('Album ID from:', {
      query: req.query,
      url: req.url,
      albumId: albumId
    });

    if (!albumId) {
      return res.status(400).json({
        success: false,
        error: 'Album ID is required'
      });
    }

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

    // Parse form data and get file
    let fileData;
    try {
      fileData = await parseFormData(req);
    } catch (error) {
      console.error('Error parsing form data:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to parse form data. Make sure you are sending multipart/form-data with an "image" field.'
      });
    }

    if (!fileData.buffer || !fileData.filename) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileData.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed (JPG, PNG, GIF, WebP)'
      });
    }

    // Validate file size (10MB limit)
    if (fileData.buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image size must be less than 10MB'
      });
    }

    // Upload to Supabase Storage
    const imageUrl = await uploadToSupabaseStorage(
      fileData.buffer,
      fileData.filename,
      fileData.mimetype
    );

    // Insert image record
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
        is_cover: updatedAlbum?.cover_image_id === image.id,
        created_at: image.created_at
      }
    });

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

