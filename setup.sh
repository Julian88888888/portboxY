#!/bin/bash

echo "🚀 Setting up Model Portfolio Application"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL v8.0 or higher."
    exit 1
fi

echo "✅ Node.js and MySQL are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/config.env.example backend/.env
    echo "⚠️  Please update backend/.env with your database credentials"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MySQL credentials"
echo "2. Create a MySQL database named 'model_portfolio_db'"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: npm start"
echo ""
echo "For detailed instructions, see README.md" 