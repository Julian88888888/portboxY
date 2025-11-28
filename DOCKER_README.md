# Docker Setup for Model Portfolio Application

This Docker Compose setup provides a complete development environment for the Model Portfolio application with frontend, backend, and MongoDB database.

## Services

- **Frontend**: React application running on port 3000
- **Backend**: Node.js/Express API running on port 5000
- **MongoDB**: Database running on port 27017
- **Nginx**: Reverse proxy running on port 80 (optional)

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Development Commands

### Start specific services
```bash
# Start only backend and database
docker-compose up -d mongodb backend

# Start only frontend
docker-compose up -d frontend
```

### Rebuild services
```bash
# Rebuild all services
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend
```

### Access services
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Nginx (if enabled): http://localhost:80

## Environment Variables

### Backend Environment
- `NODE_ENV`: development/production
- `PORT`: 5000
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origins

### Frontend Environment
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENVIRONMENT`: development/production

## Database

MongoDB is automatically initialized with:
- Database: `model_portfolio_db`
- Collections: `users`, `portfolios`
- Indexes: email (unique), username (unique), userId

## Production Deployment

For production, modify the docker-compose.yml:

1. Remove volume mounts for source code
2. Use production environment variables
3. Enable nginx service
4. Add SSL certificates
5. Use production Docker images

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, 27017 are available
2. **Permission issues**: Run `docker-compose down` and restart
3. **Database connection**: Check MongoDB container logs
4. **Build failures**: Clear Docker cache with `docker system prune`

### Useful Commands

```bash
# View container status
docker-compose ps

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# View service logs
docker-compose logs backend
docker-compose logs frontend

# Reset everything
docker-compose down -v
docker system prune -a
```

## Security Notes

- Change default MongoDB credentials in production
- Use strong JWT secrets
- Enable HTTPS in production
- Configure proper CORS settings
- Use environment variables for sensitive data 