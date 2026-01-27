#!/bin/bash

# Disable screen saver and power management
xset s off
xset -dpms
xset s noblank

# Hide cursor when inactive
unclutter -idle 0.1 -root &

# Launch Chromium in Kiosk Mode
# Pointing to the FastAPI backend which serves the frontend
chromium-browser --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI http://localhost:8000
