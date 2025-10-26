#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

echo "🚀 Starting AREA Application..."

# Start Laravel server in background
echo "📡 Starting Laravel server..."
cd backend
php artisan serve --host=localhost --port=8000 &
LARAVEL_PID=$!

# Start scheduler in background
echo "⏰ Starting Laravel scheduler..."
php artisan schedule:work &
SCHEDULER_PID=$!

# Start frontend development server
echo "🎨 Starting frontend server..."
cd ../frontend

# Load nvm and use Node 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 20
npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup when script is terminated
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $LARAVEL_PID 2>/dev/null
    kill $SCHEDULER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 Goodbye!"
    exit 0
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

# Wait for all background processes
wait
