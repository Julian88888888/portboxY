# Model Portfolio React Application

A modern portfolio platform for models, photographers, stylists, and makeup artists built with React frontend and Node.js/MySQL backend.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **User Types**: Support for models, photographers, stylists, makeup artists, and hair stylists
- **Portfolio Management**: Create and manage portfolios with images
- **Responsive Design**: Mobile-friendly interface
- **Security**: Password hashing, input validation, and rate limiting

## Tech Stack

### Frontend
- React 18
- React Icons
- CSS3 with custom styling
- Local Storage for session management

### Backend
- Node.js
- Express.js
- MySQL2
- bcryptjs for password hashing
- JWT for authentication
- Express Validator for input validation
- Helmet for security headers
- CORS for cross-origin requests
- Rate limiting for API protection

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd PBV2-1
```

### 2. Backend Setup

#### Install backend dependencies
```bash
cd backend
npm install
```

#### Database Configuration
1. Create a MySQL database:
```sql
CREATE DATABASE model_portfolio_db;
```

2. Copy the environment configuration:
```bash
cp config.env.example .env
```

3. Update the `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=model_portfolio_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Start the backend server
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

#### Install frontend dependencies
```bash
# From the root directory
npm install
```

#### Start the frontend development server
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Health Check
- `GET /health` - Server health check

## Database Schema

### Users Table
- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `phone` - Phone number (optional)
- `password_hash` - Hashed password
- `user_type` - Enum: photographer, model, stylist, makeup_artist, hair_stylist
- `profile_image` - Profile image URL (optional)
- `bio` - User bio (optional)
- `is_verified` - Account verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Portfolios Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `title` - Portfolio title
- `description` - Portfolio description
- `is_public` - Public visibility flag
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Portfolio Images Table
- `id` - Primary key
- `portfolio_id` - Foreign key to portfolios table
- `image_url` - Image URL
- `caption` - Image caption (optional)
- `display_order` - Display order
- `created_at` - Creation timestamp

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

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries with mysql2

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

### Backend (.env)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `DB_PORT` - MySQL port
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration time
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

### Frontend
- `REACT_APP_API_URL` - Backend API URL (defaults to http://localhost:5000/api)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
   - Check that both servers are running

3. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in backend `.env`
   - Check token expiration settings

4. **Port Conflicts**
   - Change `PORT` in backend `.env` if 5000 is in use
   - Update `REACT_APP_API_URL` in frontend if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team. 