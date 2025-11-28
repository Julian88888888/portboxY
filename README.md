# Model Portfolio React Application

A modern portfolio platform for models, photographers, stylists, and makeup artists built with React frontend and **Supabase** for authentication and storage.

## 🎉 NEW: Supabase Authentication

This application now uses **Supabase** for authentication and file storage! 

### Quick Start with Supabase
1. **Read [SUPABASE_README.md](SUPABASE_README.md)** for an overview
2. **Follow [QUICKSTART.md](QUICKSTART.md)** to set up in 5 minutes
3. **See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for detailed configuration
4. **Check [SUPABASE_IMPLEMENTATION.md](SUPABASE_IMPLEMENTATION.md)** for technical details

### Why Supabase?
- ✅ Enterprise-grade authentication
- ✅ Built-in session management
- ✅ Secure file storage with CDN
- ✅ Real-time capabilities
- ✅ Row Level Security
- ✅ Free tier available

## Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **User Types**: Support for models, photographers, stylists, makeup artists, and hair stylists
- **Profile Photos**: Upload and manage profile photos with Supabase Storage
- **Portfolio Management**: Create and manage portfolios with images
- **Responsive Design**: Mobile-friendly interface
- **Security**: Built-in security with Supabase (password hashing, JWT, rate limiting)
- **Session Management**: Automatic token refresh and secure session storage

## Tech Stack

### Frontend
- React 18
- React Icons
- CSS3 with custom styling
- Supabase JS Client for authentication

### Backend / Services
- **Supabase** (Primary)
  - Authentication
  - User metadata storage
  - File storage (profile photos)
  - Real-time subscriptions
- **Node.js/Express** (Optional - for additional services)
  - Custom API endpoints
  - Business logic
  - MySQL database integration

## Prerequisites

- Node.js (v14 or higher)
- npm, yarn, or pnpm
- A Supabase account (free tier available at https://supabase.com)

## Installation

### Quick Setup (Recommended)

**Follow the [QUICKSTART.md](QUICKSTART.md) guide for a 5-minute setup!**

### Manual Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd portboxgit
```

#### 2. Install dependencies
```bash
pnpm install
# or
npm install
```

#### 3. Set up Supabase

1. Create a Supabase project at https://app.supabase.com
2. Get your API credentials from Settings → API
3. Create a `.env` file:
```bash
cp env.example .env
```

4. Add your Supabase credentials to `.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Set up storage bucket (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))

#### 4. Start the application
```bash
pnpm start
# or
npm start
```

The app will be running on `http://localhost:3000`

### Optional: Backend API (if needed)

If you need the optional Node.js backend:

```bash
cd backend
npm install
npm run dev
```

See backend README for database configuration.

## Authentication API (Supabase)

All authentication is handled through Supabase Auth. Use the `useAuth()` hook in your components:

```javascript
import { useAuth } from './contexts/AuthContext';

const { 
  user,                    // Current user
  login,                   // Login function
  register,                // Register function
  logout,                  // Logout function
  updateProfile,           // Update profile
  uploadProfilePhotos,     // Upload photos
  // ... more methods
} = useAuth();
```

### Available Methods
- `register(userData)` - User registration
- `login(credentials)` - User login
- `logout()` - User logout
- `updateProfile(profileData)` - Update user profile
- `uploadProfilePhotos(files)` - Upload profile photos
- `deleteProfilePhoto(photoId)` - Delete a photo
- `setMainPhoto(photoId)` - Set main profile photo
- `resetPassword(email)` - Send password reset email
- `changePassword(newPassword)` - Change password

See [SUPABASE_IMPLEMENTATION.md](SUPABASE_IMPLEMENTATION.md) for complete API reference.

## User Data Structure (Supabase)

User data is stored in Supabase Auth with metadata:

```javascript
{
  id: "uuid",                    // Supabase user ID
  email: "user@example.com",     // User email
  user_metadata: {
    firstName: "John",           // First name
    lastName: "Doe",             // Last name
    phone: "+1234567890",        // Phone number
    userType: "model",           // User type
    profilePhotos: [             // Profile photos
      {
        id: "filename",
        url: "https://...",
        uploadedAt: "timestamp",
        isMain: true
      }
    ]
  }
}
```

Photos are stored in Supabase Storage bucket: `profile-photos`

## Usage

### Registration
1. Click "Sign Up" in the header
2. Fill in your details:
   - First Name
   - Last Name
   - Email Address
   - Phone Number (optional)
   - Password (minimum 8 characters with uppercase, lowercase, number, and special character)
   - Confirm Password
   - User Type (Model, Photographer, Stylist, Makeup Artist, or Hair Stylist)
3. Agree to Terms of Service
4. Click "Create Account"

### Login
1. Click "Login" in the header
2. Enter your email and password
3. Click "Sign In"

### Profile Management
- Update your profile information
- Change your password
- View your account details

## Security Features

Built-in security with Supabase:
- 🔒 **Secure Password Hashing**: Automatic with Supabase Auth
- 🔒 **JWT Authentication**: Industry-standard tokens
- 🔒 **Session Management**: Secure, automatic token refresh
- 🔒 **Rate Limiting**: Built-in API protection
- 🔒 **Row Level Security**: Database-level access control
- 🔒 **Storage Policies**: File access control
- 🔒 **Email Verification**: Optional email confirmation
- 🔒 **CORS Protection**: Configurable cross-origin policies

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
npm start  # Start React development server
```

### Database Migrations
The database tables are automatically created when the server starts. If you need to reset the database:

1. Drop and recreate the database
2. Restart the server

## Environment Variables

### Required (.env)
```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional (.env)
```env
REACT_APP_API_URL=http://localhost:5002/api  # For additional backend services
```

⚠️ **Never commit your `.env` file to version control!**

See `env.example` for a template.

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Create `.env` file with Supabase credentials
   - Restart development server after adding variables

2. **Photos won't upload**
   - Verify `profile-photos` bucket exists in Supabase
   - Check storage policies are configured (see SUPABASE_SETUP.md)
   - Ensure bucket is set to public

3. **Can't login after registration**
   - Check if email verification is required in Supabase settings
   - Look for confirmation email in spam folder
   - Verify user exists in Supabase dashboard

4. **Old backend errors**
   - Clear browser localStorage: `localStorage.clear()`
   - Refresh the page
   - Check you're using the new Supabase authentication

For more troubleshooting, see [QUICKSTART.md](QUICKSTART.md) or [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Documentation

- **[SUPABASE_README.md](SUPABASE_README.md)** - Supabase implementation overview
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Detailed setup guide
- **[SUPABASE_IMPLEMENTATION.md](SUPABASE_IMPLEMENTATION.md)** - Technical documentation

## Support

### Getting Help
1. Check the documentation files above
2. Review troubleshooting sections
3. Check browser console for errors
4. Visit [Supabase Documentation](https://supabase.com/docs)
5. Join [Supabase Discord](https://discord.supabase.com/)
6. Open an issue in this repository 