#!/bin/sh
# launsher.sh

while ! ping -c 1 -W 1 8.8.8.8; do
	echo "Wainting for connection..."
	sleep 1
done
cd /
cd /home/pi/einsatzmonitor
sudo node start.js
cd /
