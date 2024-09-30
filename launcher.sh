#!/bin/sh
# launcher.sh

while ! ping -c 1 -W 1 8.8.8.8; do
	echo "Wainting for connection..."
	sleep 1
done
echo "Online..."
cd "$(dirname "$0")"
echo "changed Dir"
sudo node start.js
echo "started node backend server"
sleep 3
sudo node startx.js
echo "started XServer"