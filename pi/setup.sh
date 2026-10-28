#!/bin/bash
# GRV6 kiosk setup for a Raspberry Pi 4 on Raspberry Pi OS Lite (64-bit, Debian trixie).
# Run from a checkout of this repository:  bash pi/setup.sh
# Put the two .deb files from a release (mixxx_*.deb and mixxx-data_*.deb) in the repository folder first,
# or install them yourself afterwards.
set -e
REPO="$(cd "$(dirname "$0")/.." && pwd)"

echo "== 1. Packages =="
sudo apt update
sudo apt install -y xserver-xorg xserver-xorg-input-libinput xinit x11-xserver-utils openbox \
  udisks2 udiskie feh exfatprogs ntfs-3g alsa-utils fonts-dejavu-core

echo "== 2. Mixxx (GRV6 build) =="
shopt -s nullglob
debs=("$REPO"/mixxx_*.deb "$REPO"/mixxx-data_*.deb)
if [ ${#debs[@]} -gt 0 ]; then
  sudo apt install -y --allow-downgrades "${debs[@]}"
else
  echo "No .deb files in $REPO - download them from the Releases page and run:"
  echo "  sudo apt install --allow-downgrades ./mixxx_*.deb ./mixxx-data_*.deb"
fi

echo "== 3. Skin and controller mapping =="
mkdir -p ~/.mixxx/skins ~/.mixxx/controllers
rm -rf ~/.mixxx/skins/GRV6
cp -r "$REPO/GRV6" ~/.mixxx/skins/
cp "$REPO"/controller/DDJ-GRV6-Custom* ~/.mixxx/controllers/

echo "== 4. Start Mixxx full screen at boot =="
install -m 755 "$REPO/pi/xinitrc" ~/.xinitrc
cat > ~/.bash_profile <<'EOF'
[ -f ~/.profile ] && . ~/.profile
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
  exec startx
fi
EOF
sudo raspi-config nonint do_boot_behaviour B2   # console autologin

echo "== 5. POWER OFF and USB eject without a password prompt =="
rule="$USER ALL=(root) NOPASSWD: /usr/sbin/poweroff, /usr/sbin/reboot, /usr/bin/umount"
tmp="$(mktemp)"
echo "$rule" > "$tmp"
sudo visudo -cf "$tmp"
sudo install -m 440 -o root -g root "$tmp" /etc/sudoers.d/grv6
rm -f "$tmp"

echo "== 6. CPU at full speed =="
sudo tee /etc/systemd/system/cpu-performance.service >/dev/null <<'EOF'
[Unit]
Description=CPU performance governor

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo performance | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor'

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable --now cpu-performance.service

echo "== Done. Reboot, then in Mixxx: Preferences > Interface > skin GRV6, Preferences > Controllers > DDJ-GRV6 Custom. =="
