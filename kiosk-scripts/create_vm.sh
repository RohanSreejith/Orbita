#!/bin/bash

# create_vm.sh
# Automates the creation of a VirtualBox VM for testing Orbita Kiosk

VM_NAME="Orbita_Kiosk_Test"
ISO_PATH=""
DOWNLOADS_DIR="$HOME/Downloads"

echo "=== Orbita VM Creator ==="

# 1. Check for VirtualBox
if ! command -v VBoxManage &> /dev/null; then
    echo "Error: VirtualBox is not installed or not in PATH."
    echo "Please install VirtualBox: sudo apt install virtualbox"
    exit 1
fi

# 2. Find or Request ISO
echo "Searching for Ubuntu ISO in $DOWNLOADS_DIR..."
FOUND_ISO=$(find "$DOWNLOADS_DIR" -maxdepth 1 -name "*ubuntu*.iso" | head -n 1)

if [ -n "$FOUND_ISO" ]; then
    echo "Found ISO: $FOUND_ISO"
    read -p "Use this ISO? [Y/n] " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        read -p "Enter full path to Ubuntu ISO: " ISO_PATH
    else
        ISO_PATH="$FOUND_ISO"
    fi
else
    echo "No Ubuntu ISO found automatically."
    read -p "Enter full path to Ubuntu ISO: " ISO_PATH
fi

if [ ! -f "$ISO_PATH" ]; then
    echo "Error: ISO file not found at $ISO_PATH"
    exit 1
fi

# 3. Create VM
echo "Creating VM: $VM_NAME..."
# Delete if exists (Cleanup)
VBoxManage unregistervm "$VM_NAME" --delete 2>/dev/null

# Create
VBoxManage createvm --name "$VM_NAME" --ostype "Ubuntu_64" --register

# 4. Configure Hardware
echo "Configuring Hardware..."
VBoxManage modifyvm "$VM_NAME" \
    --memory 4096 \
    --cpus 2 \
    --vram 128 \
    --graphicscontroller vmsvga \
    --accelerate3d on \
    --nic1 nat \
    --audio none \
    --boot1 dvd \
    --boot2 disk

# 5. Create Storage
echo "Creating Virtual Disk..."
mkdir -p "$HOME/VirtualBox VMs/$VM_NAME"
DISK_PATH="$HOME/VirtualBox VMs/$VM_NAME/$VM_NAME.vdi"
VBoxManage createhd --filename "$DISK_PATH" --size 20000 --format VDI

# 6. Attach Storage
echo "Attaching Storage..."
# SATA Controller for Disk
VBoxManage storagectl "$VM_NAME" --name "SATA" --add sata --controller IntelAHCI
VBoxManage storageattach "$VM_NAME" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "$DISK_PATH"

# IDE Controller for CD (ISO)
VBoxManage storagectl "$VM_NAME" --name "IDE" --add ide
VBoxManage storageattach "$VM_NAME" --storagectl "IDE" --port 0 --device 0 --type dvddrive --medium "$ISO_PATH"

echo ""
echo "=== VM Created Successfully! ==="
echo "VM Name: $VM_NAME"
echo ""
echo "Next Steps:"
echo "1. The VM will start automatically in 5 seconds."
echo "2. Install Ubuntu as usual."
echo "3. Copy the 'Orbita' folder into the VM."
echo "4. Run 'sudo ./setup_kiosk.sh' inside the VM."
echo ""
read -p "Press Enter to start the VM now..."

VBoxManage startvm "$VM_NAME"
