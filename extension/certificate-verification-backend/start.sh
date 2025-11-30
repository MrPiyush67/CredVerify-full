#!/bin/bash

# Certificate Verification Backend - Quick Start Script

echo "🚀 Starting Certificate Verification Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created! Please edit it with your configuration:"
    echo "   - MONGODB_URI"
    echo "   - GROQ_API_KEY"
    echo "   - ALLOWED_ORIGINS (your Chrome extension ID)"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if MongoDB is running (optional)
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running!"
    else
        echo "⚠️  MongoDB doesn't seem to be running locally."
        echo "   If using MongoDB Atlas, ignore this warning."
        echo "   If using local MongoDB, start it with: brew services start mongodb-community"
    fi
else
    echo "ℹ️  mongosh not found. Skipping MongoDB check."
fi

echo ""
echo "🎯 Starting server..."
echo ""

# Start the server
npm run dev
