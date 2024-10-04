x#!/bin/sh
sleep 3

# Disable xset blanking, let xscreensaver handle that.
xset s noblank
xset s off
xset -dpms


# Hide the mouse cursor.
unclutter -idle 1 -root &

# Let Chromium think it always exited cleanly.
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' '~/.config/chromium/Default/Preferences'
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' '~/.config/chromium/Default/Preferences'

chromium-browser http://localhost:4000/ --window-size=1920,1080 --kiosk --incognito --disable-infobars >





