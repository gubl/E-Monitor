#!/bin/sh
# launcher.sh

while ! ping -c 1 -W 1 8.8.8.8; do
	echo "Wainting for connection..."
	sleep 1
done
cd "$(dirname "$0")"
sudo node start.js
sleep 3
sudo python startx.py
