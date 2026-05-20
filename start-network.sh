#!/bin/bash

# Start both backend and frontend servers

IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo "🚀 Starting Loan Management System..."
echo ""
echo "🌐 Your IP Address: $IP_ADDRESS"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "📦 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev -- --hostname 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo ""
echo "📋 Access URLs:"
echo "   Local:   http://localhost:3000"
echo "   Network: http://$IP_ADDRESS:3000"
echo ""
echo "📱 Share with others: http://$IP_ADDRESS:3000"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for processes
wait
