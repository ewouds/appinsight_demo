#!/bin/bash

# Application Insights PoC - Quick Setup Script
# This script helps set up the project quickly for new users

echo "🚀 Application Insights PoC - Quick Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Application Insights connection string"
    echo "   Get it from: Azure Portal → Application Insights → Overview → Connection String"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎯 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Application Insights connection string"
echo "2. Run: npm start"
echo "3. Open: http://localhost:3000"
echo ""
echo "📖 For detailed setup instructions, see README.md"
echo "🔧 For troubleshooting, see docs/TROUBLESHOOTING.md"
echo ""
echo "🚀 Ready to explore Azure Application Insights!"
