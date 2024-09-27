#!/bin/sh
# launch_k.sh

while ! ping -c 1 -W 1 8.8.8.8; do
	echo "Wainting for connection..."
	sleep 1
done
cd /
sleep 3
cd /home/pi
sudo python startx.py
cd /
