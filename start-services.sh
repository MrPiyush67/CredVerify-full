#!/bin/bash

# Start script for CredVerify with Surya OCR
# This script helps you start both the Python OCR service and Node.js backend

echo "=================================================="
echo "  CredVerify - Starting Services with Surya OCR"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend/ocr-service" ]; then
    echo "❌ Error: Must run from CredVerify-full directory"
    echo "   cd to CredVerify-full and try again"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check if OCR service virtual environment exists
if [ ! -d "backend/ocr-service/venv" ]; then
    echo "⚠️  Virtual environment not found for OCR service"
    echo "   Creating virtual environment..."
    cd backend/ocr-service
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
    echo "   Installing Python dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ../..
    echo "✅ Python dependencies installed"
    echo ""
fi

# Check if Node.js dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Node.js dependencies not found"
    echo "   Installing Node.js dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Node.js dependencies installed"
    echo ""
fi

# Check if ports are already in use
if check_port 5000; then
    echo "⚠️  Port 5000 is already in use (OCR service)"
    echo "   Kill the process or use a different port"
fi

if check_port 8003; then
    echo "⚠️  Port 8003 is already in use (Node.js backend)"
    echo "   Kill the process or use a different port"
fi

echo "=================================================="
echo "  Starting Services"
echo "=================================================="
echo ""
echo "This will open 2 terminal windows:"
echo "  1. Python OCR Service (port 5000)"
echo "  2. Node.js Backend (port 8003)"
echo ""
echo "Press Ctrl+C in each terminal to stop the services"
echo ""

# Detect OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Opening terminals on macOS..."

    # Start OCR service in new terminal
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend/ocr-service && source venv/bin/activate && echo \"🐍 Starting Python OCR Service...\" && python app.py"'

    # Wait a bit for OCR service to start
    sleep 3

    # Start Node.js backend in new terminal
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend && echo \"🚀 Starting Node.js Backend...\" && npm run dev"'

    echo ""
    echo "✅ Services starting in separate terminal windows"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Opening terminals on Linux..."

    # Try to detect terminal emulator
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/backend/ocr-service && source venv/bin/activate && echo '🐍 Starting Python OCR Service...' && python app.py; exec bash"
        sleep 3
        gnome-terminal -- bash -c "cd $PWD/backend && echo '🚀 Starting Node.js Backend...' && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $PWD/backend/ocr-service && source venv/bin/activate && echo '🐍 Starting Python OCR Service...' && python app.py" &
        sleep 3
        xterm -e "cd $PWD/backend && echo '🚀 Starting Node.js Backend...' && npm run dev" &
    else
        echo "❌ No terminal emulator found"
        echo "   Please start services manually:"
        echo ""
        echo "   Terminal 1:"
        echo "   cd backend/ocr-service && source venv/bin/activate && python app.py"
        echo ""
        echo "   Terminal 2:"
        echo "   cd backend && npm run dev"
        exit 1
    fi

    echo ""
    echo "✅ Services starting in separate terminal windows"

else
    # Windows or other
    echo "❌ Automatic terminal opening not supported on this OS"
    echo ""
    echo "Please start services manually in separate terminals:"
    echo ""
    echo "Terminal 1 (OCR Service):"
    echo "  cd backend/ocr-service"
    echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
    echo "  python app.py"
    echo ""
    echo "Terminal 2 (Node.js Backend):"
    echo "  cd backend"
    echo "  npm run dev"
    exit 1
fi

echo ""
echo "=================================================="
echo "  Services Started"
echo "=================================================="
echo ""
echo "📍 Python OCR Service: http://localhost:5000"
echo "📍 Node.js Backend: http://localhost:8003"
echo ""
echo "Next steps:"
echo "  1. Load extension in browser (chrome://extensions/)"
echo "  2. Navigate to a certificate page"
echo "  3. Click extension icon and verify certificate"
echo ""
echo "To stop services: Press Ctrl+C in each terminal window"
echo ""
