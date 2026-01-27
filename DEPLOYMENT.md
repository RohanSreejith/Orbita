# 🚀 Orbita Kiosk Deployment Guide

Follow these steps to convert a fresh PC/Laptop/Raspberry Pi into an **Orbita Smart Kiosk**.

## 1. BIOS / Hardware Prep
*   **Secure Boot**: Disable (Optional, but helps with some Linux drivers).
*   **Power Settings**: Set "Restore on AC Power Loss" to **Power On** (if available) so the kiosk turns on automatically after a blackout.

## 2. OS Installation (Ubuntu)
1.  Install **Ubuntu Desktop (22.04 LTS or newer)**.
2.  Create a user named `kiosk` (Password: `kiosk` or similar).
3.  Enable "Auto-Login" during installation.

> [!NOTE]
> **Dual-Boot Users (Windows + Ubuntu):**
> My setup steps ONLY affect what happens *after* Ubuntu loads.
> When you restart your computer, you will still see the standard **GRUB Menu** to choose between Windows and Ubuntu.
> The Kiosk mode will only start if you select **Ubuntu**.

## 3. Clone Repository
Open a terminal (`Ctrl+Alt+T`) and run:
```bash
cd ~
git clone https://github.com/RohanSreejith/Orbita.git
```
*Note: If private, use SSH keys or HTTPS with a token.*

## 4. Run Setup Script
We have an automated script that installs:
*   **Chrome** (for Kiosk display)
*   **Python/Node** (for Backend/Frontend)
*   **Openbox** (lightweight window manager)

Run this:
```bash
cd ~/Orbita
chmod +x kiosk-scripts/setup_kiosk.sh
./kiosk-scripts/setup_kiosk.sh
```
*Enter your password when prompted.*

## 5. Launch
Once the script finishes:
1.  **Reboot** your machine.
2.  If it doesn't auto-start, log in and run:
    ```bash
    startx
    ```

## 6. 🛑 How to Exit Kiosk Mode
Since the specific purpose of Kiosk mode is to prevent users from exiting, it can be tricky!

### Option A: Keyboard Shortcuts (If Keyboard Attached)
*   **Close App**: Press `Alt + F4` to close the browser. This will usually drop you back to the command line or restart the X session.
*   **Switch to Terminal**: Press `Ctrl + Alt + F3` (or F4/F5) to switch to a TTY text console. Log in with your user/password.
*   **Kill X Server**: Press `Alt + SysRq + K` (if enabled) or `Ctrl + Alt + Backspace`.

### Option B: SSH (Recommended)
The professional way to manage a kiosk is via network.
1.  On the Kiosk, install SSH: `sudo apt install openssh-server`
2.  From another PC, run: `ssh kiosk@<ip-address>`
3.  To restart the browser remotely: `pkill chromium` or `sudo reboot`.

## 7. 🔙 Restoring Normal Desktop
To disable Kiosk mode and get your normal Ubuntu desktop back:

1.  Exit to a terminal (Ctrl+Alt+F3).
2.  Login with your username/password.
3.  Delete the Kiosk startup file:
    ```bash
    rm ~/.xinitrc
    ```
4.  Reboot:
    ```bash
    sudo reboot
    ```
5.  Ubuntu will now load the standard Desktop Environment (GNOME).

## 🛠️ Troubleshooting
*   **White Screen?** Check `~/Orbita/frontend/frontend.log`.
*   **API Errors?** Check `~/Orbita/backend/backend.log`.
*   **Exit Kiosk?** Press `Alt + F4` or `Ctrl + Alt + Backspace`.
