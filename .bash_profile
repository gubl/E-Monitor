while ! ping -c 1 -W 1 8.8.8.8; do
        echo "Wainting for connection..."
        sleep 1
done
echo "Online..."

pm2 start ./E-Monitor/server.js

sleep 2

[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx ./E-Monitor/startchrome.sh  -nocursor
