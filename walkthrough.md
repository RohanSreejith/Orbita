# Orbita Kiosk Setup Walkthrough

This guide explains how to set up the Orbita Kiosk system on a fresh Ubuntu installation (running in a VM).

## Prerequisites
- A fresh **Ubuntu 22.04 / 24.04** Virtual Machine.
- Access to the internet in the VM.
- This `Orbita` project folder copied to the VM.

## Setup Instructions

1.  **Boot the VM** into the Ubuntu desktop.
2.  **Open a Terminal** inside the `Orbita` folder.
3.  **Run the Setup Script**:
    ```bash
    cd kiosk-scripts
    sudo ./setup_kiosk.sh
    ```
4.  **Wait for Completion**: The script will:
    - Update system dependencies.
    - Build the React Frontend.
    - Set up the Backend Service (systemd).
    - Configure Auto-Login.
    - Set up the Custom Boot Splash (Plymouth).
5.  **Reboot**:
    ```bash
    sudo reboot
    ```

## What to Expect (Verification)

### 1. Boot Splash
During reboot, you should see the **Orbita Logo** pulsing on a black background instead of the scrolling text logs or default Ubuntu logo.

![Orbita Logo](/home/karthik-unni/.gemini/antigravity/brain/fae49c7c-c3fc-4374-af97-d15a2f32b59b/orbita_logo_1769522788141.png)

### 2. Kiosk Mode
After the boot splash, the system will automatically login and launch the full-screen kiosk application.
- **Top Left**: Weather and Date widgets.
- **Center**: "Scan QR Code" interface.
- **No Desktop**: No start menubar, taskbar, or window controls will be visible.

## Troubleshooting
- **If the browser doesn't start**: Try running `systemctl status orbita-backend` to ensure the backend server is running.
- **If the boot splash doesn't show**: Ensure the VM has 3D acceleration enabled or enough video memory, as Plymouth sometimes requires it.
