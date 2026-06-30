/**
 * Vercel Serverless Function for uploading images to albums
 * Handles POST /api/albums/:id/images
 */

const { supabase, verifyToken, getAlbumForUser } = require('../../_lib/albumsAuth');
const busboy = require('busboy');

const MAX_IMAGES_PER_ALBUM = 20;
const getMaxImagesError = () => `Maximum ${MAX_IMAGES_PER_ALBUM} images per album`;

/**
 * Parse multipart/form-data and extract file
 */
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
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
        // Try parsing from req.url using regex
        const urlMatch = req.url.match(/\/albums\/([^\/]+)\/images/);
        if (urlMatch) {
          albumId = urlMatch[1];
        } else {
          // Fallback: parse from URL parts
          const urlParts = req.url.split('/').filter(Boolean);
          const albumsIndex = urlParts.indexOf('albums');
          if (albumsIndex >= 0 && albumsIndex < urlParts.length - 1) {
            albumId = urlParts[albumsIndex + 1];
          }
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
        // Try parsing from req.url
        const urlMatch = req.url.match(/\/albums\/([^\/]+)\/images/);
        if (urlMatch) {
          albumId = urlMatch[1];
        } else {
          // Fallback: parse from URL parts
          const urlParts = req.url.split('/').filter(Boolean);
          const albumsIndex = urlParts.indexOf('albums');
          if (albumsIndex >= 0 && albumsIndex < urlParts.length - 1) {
            albumId = urlParts[albumsIndex + 1];
          }
        }
      }
      
      // Log for debugging
      console.log('Album ID from:', {
        query: req.query,
        url: req.url,
        path: req.url?.split('?')[0],
        albumId: albumId
      });

    if (!albumId) {
      return res.status(400).json({
        success: false,
        error: 'Album ID is required'
      });
    }

    // Check if album exists and belongs to user
    const { error: ownershipError, album, status: ownershipStatus } = await getAlbumForUser(albumId, user.id);
    if (ownershipError) {
      return res.status(ownershipStatus).json({
        success: false,
        error: ownershipError
      });
    }

    const { count: imageCount, error: imageCountError } = await supabase
      .from('images')
      .select('id', { count: 'exact', head: true })
      .eq('album_id', albumId);

    if (!imageCountError && imageCount >= MAX_IMAGES_PER_ALBUM) {
      return res.status(400).json({
        success: false,
        error: getMaxImagesError(),
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

    // Validate file size (2MB limit)
    if (fileData.buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image must be 2 MB or smaller'
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
    }

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

