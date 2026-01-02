# Image Albums Feature - API Documentation

This document describes the REST API endpoints for managing albums and images.

## Database Schema

### Albums Table
- `id` (UUID, PK) - Unique album identifier
- `title` (TEXT, NOT NULL) - Album title
- `description` (TEXT, nullable) - Album description
- `cover_image_id` (UUID, nullable, FK → images.id) - Reference to cover image
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Images Table
- `id` (UUID, PK) - Unique image identifier
- `album_id` (UUID, NOT NULL, FK → albums.id, ON DELETE CASCADE) - Parent album
- `url` (TEXT, NOT NULL) - Image URL/path
- `created_at` (TIMESTAMP) - Creation timestamp

## Business Logic

1. **One album → many images**: Each album can contain multiple images
2. **Image belongs to only one album**: Each image is associated with exactly one album
3. **Deleting album deletes all images**: CASCADE delete ensures images are removed when album is deleted
4. **Automatic cover image management**:
   - If album has no cover → first uploaded image becomes cover (handled by DB trigger)
   - If cover image is deleted → next image becomes cover (handled by DB trigger)

## API Endpoints

### Base URL
```
http://localhost:5002/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_access_token>
```

---

## 1. Create Album

**POST** `/albums`

Create a new album with title and optional description.

### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "My Fashion Portfolio",
  "description": "High fashion photography work"
}
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Fashion Portfolio",
    "description": "High fashion photography work",
    "cover_image_id": null,
    "cover_image_url": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Title is required"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## 2. Get All Albums

**GET** `/albums`

Get all albums with their cover images. This endpoint is public (no authentication required).

### Request

**Headers:**
```
Content-Type: application/json
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "My Fashion Portfolio",
      "description": "High fashion photography work",
      "cover_image_id": "660e8400-e29b-41d4-a716-446655440001",
      "cover_image_url": "https://example.com/images/cover.jpg",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Glamour Shots",
      "description": "Creative and artistic work",
      "cover_image_id": null,
      "cover_image_url": null,
      "created_at": "2024-01-14T08:20:00Z"
    }
  ]
}
```

**Success (200 OK) - No albums:**
```json
{
  "success": true,
  "data": []
}
```

---

## 3. Upload Image to Album

**POST** `/albums/:id/images`

Upload an image file and attach it to an album. If the album has no cover image, the uploaded image automatically becomes the cover.

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
image: <file>
```

**Example using curl:**
```bash
curl -X POST \
  http://localhost:5002/api/albums/550e8400-e29b-41d4-a716-446655440000/images \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "album_id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com/storage/albums/image.jpg",
    "is_cover": true,
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Image file is required"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Album not found"
}
```

**Error (413 Payload Too Large):**
```json
{
  "success": false,
  "error": "File size exceeds 10MB limit"
}
```

---

## 4. Get Album Images

**GET** `/albums/:id/images`

Get all images belonging to a specific album. This endpoint is public (no authentication required).

### Request

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `id` (UUID) - Album ID

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "album_id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://example.com/storage/albums/image1.jpg",
      "created_at": "2024-01-15T10:35:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "album_id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://example.com/storage/albums/image2.jpg",
      "created_at": "2024-01-15T10:40:00Z"
    }
  ]
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Album not found"
}
```

---

## 5. Delete Image

**DELETE** `/images/:id`

Delete an image. If the deleted image was the cover image, the next image in the album automatically becomes the cover (handled by database trigger).

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (UUID) - Image ID

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Image not found"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## 6. Delete Album

**DELETE** `/albums/:id`

Delete an album and all its images (CASCADE delete). This operation cannot be undone.

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (UUID) - Album ID

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Album and all its images deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Album not found"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## Example Usage Flow

### 1. Create an Album
```bash
curl -X POST http://localhost:5002/api/albums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Summer Collection",
    "description": "Photos from summer 2024"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "album-123",
    "title": "Summer Collection",
    "description": "Photos from summer 2024",
    "cover_image_id": null,
    "cover_image_url": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Upload First Image (Becomes Cover)
```bash
curl -X POST http://localhost:5002/api/albums/album-123/images \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo1.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "image-456",
    "album_id": "album-123",
    "url": "https://example.com/storage/albums/photo1.jpg",
    "is_cover": true,
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

### 3. Upload More Images
```bash
curl -X POST http://localhost:5002/api/albums/album-123/images \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo2.jpg"
```

### 4. Get All Albums (with covers)
```bash
curl http://localhost:5002/api/albums
```

### 5. Get All Images in Album
```bash
curl http://localhost:5002/api/albums/album-123/images
```

### 6. Delete Image (cover will auto-update)
```bash
curl -X DELETE http://localhost:5002/api/images/image-456 \
  -H "Authorization: Bearer <token>"
```

### 7. Delete Album (all images deleted)
```bash
curl -X DELETE http://localhost:5002/api/albums/album-123 \
  -H "Authorization: Bearer <token>"
```

---

## Frontend Integration

### Using the Albums Service

```javascript
import { 
  createAlbum, 
  getAlbums, 
  uploadImageToAlbum, 
  getAlbumImages, 
  deleteImage, 
  deleteAlbum 
} from '../services/albumsService';

// Create album
const result = await createAlbum({
  title: 'My Album',
  description: 'Album description'
});

// Get all albums
const albumsResult = await getAlbums();
if (albumsResult.success) {
  console.log('Albums:', albumsResult.data);
}

// Upload image
const uploadResult = await uploadImageToAlbum(albumId, imageFile);
if (uploadResult.success) {
  console.log('Image uploaded:', uploadResult.data);
}

// Get album images
const imagesResult = await getAlbumImages(albumId);
if (imagesResult.success) {
  console.log('Images:', imagesResult.data);
}

// Delete image
const deleteResult = await deleteImage(imageId);
if (deleteResult.success) {
  console.log('Image deleted');
}

// Delete album
const deleteAlbumResult = await deleteAlbum(albumId);
if (deleteAlbumResult.success) {
  console.log('Album deleted');
}
```

---

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `413` - Payload Too Large (file size exceeds limit)
- `500` - Internal Server Error

---

## File Storage

Images are stored using one of the following methods (in order of preference):

1. **Supabase Storage** (if configured)
   - Bucket: `profile-photos` (or create dedicated `albums` bucket)
   - Path: `albums/{timestamp}-{random}.{ext}`

2. **Local File Storage** (fallback)
   - Directory: `backend/uploads/albums/`
   - URL: `/uploads/albums/{filename}`

---

## Database Triggers

The following database triggers handle automatic cover image management:

1. **set_cover_image_on_first_upload**: When an image is inserted and the album has no cover, automatically set it as cover.

2. **handle_cover_image_deletion**: When a cover image is deleted, automatically select the next image (by creation date) as the new cover.

These triggers ensure data consistency without requiring application-level logic.

---

## Notes

- All timestamps are in UTC
- Image file size limit: 10MB
- Supported image formats: JPEG, JPG, PNG, GIF, WebP
- Album deletion is permanent and cannot be undone
- Cover image selection is automatic and based on creation date



