#!/bin/bash

# Event Registration System - Environment Setup Script
# This script helps you create .env files with the correct format

echo "================================"
echo "Event Registration System Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "This script will help you set up your environment files."
echo ""

# Backend Setup
echo -e "${YELLOW}=== Backend Configuration ===${NC}"
echo ""

read -p "MongoDB Atlas Connection String: " MONGODB_URI
echo ""

read -p "JWT Secret (min 32 chars, or press Enter to generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    echo -e "${GREEN}Generated JWT Secret: $JWT_SECRET${NC}"
fi
echo ""

read -p "Backend Port (default 5000): " PORT
PORT=${PORT:-5000}
echo ""

read -p "Frontend URL (default http://localhost:3000): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
echo ""

# Create backend .env
echo -e "${YELLOW}Creating backend/.env...${NC}"

cat > backend/.env << EOF
# MongoDB Atlas Connection
MONGODB_URI=$MONGODB_URI

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=8h

# Server Configuration
PORT=$PORT
NODE_ENV=development
FRONTEND_URL=$FRONTEND_URL

# Users - GENERATE HASHES BY RUNNING: cd backend && npm run hash-password
# Then replace the hashes below with the generated ones
USER_1=operator1:\$2b\$10\$REPLACE_WITH_HASH:user
USER_2=operator2:\$2b\$10\$REPLACE_WITH_HASH:user
USER_3=operator3:\$2b\$10\$REPLACE_WITH_HASH:user
USER_4=operator4:\$2b\$10\$REPLACE_WITH_HASH:user
USER_5=operator5:\$2b\$10\$REPLACE_WITH_HASH:user
USER_6=operator6:\$2b\$10\$REPLACE_WITH_HASH:user
USER_7=admin:\$2b\$10\$REPLACE_WITH_HASH:admin
EOF

echo -e "${GREEN}✓ Created backend/.env${NC}"
echo ""

# Frontend Setup
echo -e "${YELLOW}=== Frontend Configuration ===${NC}"
echo ""

read -p "Backend API URL (default http://localhost:$PORT): " API_URL
API_URL=${API_URL:-http://localhost:$PORT}
echo ""

# Create frontend .env.local
echo -e "${YELLOW}Creating frontend/.env.local...${NC}"

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=$API_URL
EOF

echo -e "${GREEN}✓ Created frontend/.env.local${NC}"
echo ""

# Instructions
echo -e "${YELLOW}=== Next Steps ===${NC}"
echo ""
echo "1. Install backend dependencies:"
echo "   cd backend"
echo "   npm install"
echo ""
echo "2. Generate password hashes:"
echo "   npm run hash-password"
echo ""
echo "3. Copy the USER_X lines from the output and update backend/.env"
echo ""
echo "4. Install frontend dependencies:"
echo "   cd ../frontend"
echo "   npm install"
echo ""
echo "5. Start the backend:"
echo "   cd ../backend"
echo "   npm run dev"
echo ""
echo "6. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "7. Open http://localhost:3000 in your browser"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
