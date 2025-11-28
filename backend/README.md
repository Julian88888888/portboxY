# Model Portfolio Backend

A Node.js/Express backend API for the Model Portfolio application, now using MongoDB with Mongoose.

## Features

- User authentication (register, login, profile management)
- Portfolio management (create, read, update, delete)
- JWT-based authentication
- MongoDB with Mongoose ODM
- Input validation
- Rate limiting
- Security middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/model_portfolio_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

3. Start MongoDB service on your machine

4. Run the development server:
```bash
npm run dev
```

## Database Models

### User Model
- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `phone` (String, optional)
- `passwordHash` (String, required)
- `userType` (Enum: photographer, model, stylist, makeup_artist, hair_stylist)
- `profileImage` (String, optional)
- `bio` (String, optional)
- `isVerified` (Boolean, default: false)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

### Portfolio Model
- `userId` (ObjectId, ref: User, required)
- `title` (String, required)
- `description` (String, optional)
- `isPublic` (Boolean, default: true)
- `images` (Array of objects with imageUrl, caption, displayOrder)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Portfolio Management
- `GET /api/portfolios/public` - Get public portfolios
- `GET /api/portfolios/:id` - Get single portfolio
- `POST /api/portfolios` - Create portfolio (protected)
- `GET /api/portfolios/user/portfolios` - Get user's portfolios (protected)
- `PUT /api/portfolios/:id` - Update portfolio (protected)
- `DELETE /api/portfolios/:id` - Delete portfolio (protected)

## Migration from MySQL

This project has been migrated from MySQL to MongoDB. Key changes:

1. **Database Configuration**: Replaced MySQL connection pool with Mongoose connection
2. **Models**: Created Mongoose schemas instead of SQL tables
3. **Queries**: Replaced SQL queries with Mongoose methods
4. **Validation**: Leveraged Mongoose schema validation
5. **Relationships**: Used Mongoose references and virtuals

## Development

- The server runs on `http://localhost:5000`
- Health check endpoint: `GET /health`
- API documentation available at the endpoints

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with express-validator
- Rate limiting
- CORS protection
- Helmet security headers 