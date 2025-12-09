#!/bin/bash

# Start script for CredVerify with all Python services
# This script starts: Surya OCR, Course Scraper, NCrF/NSQF Calculator, and Node.js backend

echo "=========================================================="
echo "  CredVerify - Starting All Services"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
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

# Check and setup Python services virtual environments
setup_python_service() {
    local service_dir=$1
    local service_name=$2

    if [ ! -d "$service_dir/venv" ]; then
        echo "⚠️  Virtual environment not found for $service_name"
        echo "   Creating virtual environment..."
        cd "$service_dir"
        python3 -m venv venv
        echo "✅ Virtual environment created"
        echo ""
        echo "   Installing Python dependencies..."
        source venv/bin/activate
        pip install -r requirements.txt
        deactivate
        cd - > /dev/null
        echo "✅ Python dependencies installed for $service_name"
        echo ""
    fi
}

setup_python_service "backend/ocr-service" "OCR Service"
setup_python_service "backend/course-scraper-service" "Course Scraper"
setup_python_service "backend/ncrf-nsqf-service" "NCrF/NSQF Calculator"

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
if check_port 8005; then
    echo "⚠️  Port 8005 is already in use (OCR service)"
    echo "   Kill the process or use a different port"
fi

if check_port 8003; then
    echo "⚠️  Port 8003 is already in use (Node.js backend)"
    echo "   Kill the process or use a different port"
fi

if check_port 8006; then
    echo "⚠️  Port 8006 is already in use (Course Scraper)"
    echo "   Kill the process or use a different port"
fi

if check_port 8007; then
    echo "⚠️  Port 8007 is already in use (NCrF/NSQF Calculator)"
    echo "   Kill the process or use a different port"
fi

echo "=========================================================="
echo "  Starting Services"
echo "=========================================================="
echo ""
echo "This will open 4 terminal windows:"
echo "  1. Python OCR Service (port 8005)"
echo "  2. Course Scraper Service (port 8006)"
echo "  3. NCrF/NSQF Calculator (port 8007)"
echo "  4. Node.js Backend (port 8003)"
echo ""
echo "Press Ctrl+C in each terminal to stop the services"
echo ""

# Detect OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Opening terminals on macOS..."

    # Start OCR service in new terminal
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend/ocr-service && source venv/bin/activate && echo \"🐍 Starting Python OCR Service (Port 8005)...\" && python app.py"'

    # Wait a bit
    sleep 2

    # Start Course Scraper service
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend/course-scraper-service && source venv/bin/activate && echo \"🕷️  Starting Course Scraper (Port 8006)...\" && python app.py"'

    # Wait a bit
    sleep 2

    # Start NCrF/NSQF Calculator service
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend/ncrf-nsqf-service && source venv/bin/activate && echo \"📊 Starting NCrF/NSQF Calculator (Port 8007)...\" && python app.py"'

    # Wait a bit for Python services to start
    sleep 3

    # Start Node.js backend in new terminal
    osascript -e 'tell application "Terminal" to do script "cd '"$PWD"'/backend && echo \"🚀 Starting Node.js Backend (Port 8003)...\" && npm run dev"'

    echo ""
    echo "✅ Services starting in separate terminal windows"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Opening terminals on Linux..."

    # Try to detect terminal emulator
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/backend/ocr-service && source venv/bin/activate && echo '🐍 Starting Python OCR Service (Port 8005)...' && python app.py; exec bash"
        sleep 2
        gnome-terminal -- bash -c "cd $PWD/backend/course-scraper-service && source venv/bin/activate && echo '🕷️  Starting Course Scraper (Port 8006)...' && python app.py; exec bash"
        sleep 2
        gnome-terminal -- bash -c "cd $PWD/backend/ncrf-nsqf-service && source venv/bin/activate && echo '📊 Starting NCrF/NSQF Calculator (Port 8007)...' && python app.py; exec bash"
        sleep 3
        gnome-terminal -- bash -c "cd $PWD/backend && echo '🚀 Starting Node.js Backend (Port 8003)...' && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $PWD/backend/ocr-service && source venv/bin/activate && echo '🐍 Starting Python OCR Service (Port 8005)...' && python app.py" &
        sleep 2
        xterm -e "cd $PWD/backend/course-scraper-service && source venv/bin/activate && echo '🕷️  Starting Course Scraper (Port 8006)...' && python app.py" &
        sleep 2
        xterm -e "cd $PWD/backend/ncrf-nsqf-service && source venv/bin/activate && echo '📊 Starting NCrF/NSQF Calculator (Port 8007)...' && python app.py" &
        sleep 3
        xterm -e "cd $PWD/backend && echo '🚀 Starting Node.js Backend (Port 8003)...' && npm run dev" &
    else
        echo "❌ No terminal emulator found"
        echo "   Please start services manually:"
        echo ""
        echo "   Terminal 1 (OCR Service):"
        echo "   cd backend/ocr-service && source venv/bin/activate && python app.py"
        echo ""
        echo "   Terminal 2 (Course Scraper):"
        echo "   cd backend/course-scraper-service && source venv/bin/activate && python app.py"
        echo ""
        echo "   Terminal 3 (NCrF/NSQF Calculator):"
        echo "   cd backend/ncrf-nsqf-service && source venv/bin/activate && python app.py"
        echo ""
        echo "   Terminal 4 (Node.js Backend):"
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
    echo "Terminal 2 (Course Scraper):"
    echo "  cd backend/course-scraper-service"
    echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
    echo "  python app.py"
    echo ""
    echo "Terminal 3 (NCrF/NSQF Calculator):"
    echo "  cd backend/ncrf-nsqf-service"
    echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
    echo "  python app.py"
    echo ""
    echo "Terminal 4 (Node.js Backend):"
    echo "  cd backend"
    echo "  npm run dev"
    exit 1
fi

echo ""
echo "=========================================================="
echo "  Services Started"
echo "=========================================================="
echo ""
echo "📍 Python OCR Service: http://localhost:8005"
echo "📍 Course Scraper Service: http://localhost:8006"
echo "📍 NCrF/NSQF Calculator: http://localhost:8007"
echo "📍 Node.js Backend: http://localhost:8003"
echo ""
echo "Next steps:"
echo "  1. Open your CredVerify frontend application"
echo "  2. Upload a certificate using any verification method"
echo "  3. Optionally provide a course URL for NCrF/NSQF analysis"
echo "  4. View the enriched certificate with course analysis data"
echo ""
echo "To stop services: Press Ctrl+C in each terminal window"
echo ""
