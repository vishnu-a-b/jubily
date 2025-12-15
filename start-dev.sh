#!/bin/bash

# Event Registration System - Development Startup Script

echo "================================"
echo "Event Registration System"
echo "Starting Development Servers..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install
    cd ..
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env not found!${NC}"
    echo "Please create backend/.env file with your configuration"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}Error: frontend/.env.local not found!${NC}"
    echo "Please create frontend/.env.local file with your configuration"
    exit 1
fi

echo -e "${GREEN}✓ Environment files found${NC}"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started on http://localhost:5000${NC}"
else
    echo -e "${RED}✗ Backend failed to start. Check backend.log for errors${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend started on http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Frontend failed to start. Check frontend.log for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✓ All servers running!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo "  Operators: operator1/operator1pass (through operator6)"
echo "  Admin:     admin/adminpass"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for user to stop
wait
