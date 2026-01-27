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
    lightdm

# 2. Setup User Auto-Login (Assuming lightdm)
# (In a real run we would edit lightdm.conf here)

# 3. Create .xinitrc for Openbox startup
cat <<EOF > ~/.xinitrc
# Disable screen saver
xset s off
xset -dpms
xset s noblank

# Hide cursor when inactive
unclutter -idle 0.1 -root &

# Start Backend (in background)
# source ~/Orbita/backend/venv/bin/activate
# uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Start Browser in Kiosk Mode
chromium-browser --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI http://localhost:5173
EOF

echo "Setup Complete. Reboot and run 'startx' to test."
