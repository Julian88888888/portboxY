// MongoDB initialization script
db = db.getSiblingDB('model_portfolio_db');

// Create collections
db.createCollection('users');
db.createCollection('portfolios');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.portfolios.createIndex({ "userId": 1 });

print('✅ MongoDB initialized successfully'); 