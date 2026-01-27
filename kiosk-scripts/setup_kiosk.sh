#!/bin/bash

# setup_kiosk.sh
# Run this script on a fresh Ubuntu install to configure Kiosk mode.

echo "Starting Kiosk Setup..."

# 1. Update and Install Dependencies
sudo apt-get update
sudo apt-get install -y \
    openbox \
    xorg \
    chromium-browser \
    python3-pip \
    python3-venv \
    git \
    unclutter \
    nodejs \
    npm

# 2. Setup Project Dependencies
echo "Setting up Backend..."

# Detect Project Root (Parent of kiosk-scripts)
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR=$(dirname "$SCRIPT_DIR")

echo "Project Directory detected at: $PROJECT_DIR"

cd "$PROJECT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "Setting up Frontend..."
cd "$PROJECT_DIR/frontend"
npm install

# 3. Create .xinitrc for Openbox startup
cat <<EOF > ~/.xinitrc
# Disable screen saver
xset s off
xset -dpms
xset s noblank

# Hide cursor when inactive
unclutter -idle 0.1 -root &

# Start Backend (in background)
cd $PROJECT_DIR/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 > backend.log 2>&1 &

# Start Frontend (in background)
cd $PROJECT_DIR/frontend
npm run dev -- --port 5173 --host > frontend.log 2>&1 &

# Wait for servers to wake up
sleep 15

# Start Browser in Kiosk Mode
# Point to 127.0.0.1 to avoid localhost resolution issues
chromium-browser --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI http://127.0.0.1:5173
EOF

echo "Setup Complete. Reboot and run 'startx' to launch Orbita Kiosk."
