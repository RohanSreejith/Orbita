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
cd ~/Orbita/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "Setting up Frontend..."
cd ~/Orbita/frontend
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
cd ~/Orbita/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 > backend.log 2>&1 &

# Start Frontend (in background)
cd ~/Orbita/frontend
npm run dev -- --port 5173 > frontend.log 2>&1 &

# Wait for servers to wake up
sleep 10

# Start Browser in Kiosk Mode
chromium-browser --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI http://localhost:5173
EOF

echo "Setup Complete. Reboot and run 'startx' to launch Orbita Kiosk."
