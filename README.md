# E-Monitor

E-Monitor ermöglicht das anzeigen eines Einsatzmonitors des Anbieters `BlaulichtSMS`. Basierend auf einem `NodeJS` Server.
Die Software läuft auf einem `Raspberry Pi` und bietet folgende Features:

- Login und Speichern der Zugangsdaten zum Einsatzmonitor
- Automatischer Login nach einem Neustart oder Absturz
- Wenn der Display CEC-fähig ist, kann der Display automatisch in Standby versetzt werden und mittels Alarm oder Info wieder für eine bestimmte Zeit eigeschaltet werden.
- Taster zum Anzeigen des Display für eine bestimmte Zeit (mit CEC)

#### Der Monitor läuft bei uns seit Jahren so ohne Probleme, aber das Projekt ist bei weitem **nicht fertig**, dennoch möchte ich es für Interessierte hier anbieten.


## Voraussetzungen

- Raspberry Pi mit Raspbian OS Headless (getestet und empfohlen wird der Pi 3 B+)
- Benutzer pi
- Display / Monitor oder anderes Anzeigegerät (optional mit CEC)
- Maus / Tastatur zum konfiguieren direkt am Display
- oder ein PC um alles über ssh zu konfigurieren

#### Aus zeitlichen Gründen wird es keine bis nur sehr wenig Updates geben. Bei Fragen bitte einfach kontaktieren.

## Installation

Einfach am Pi als Benutzer pi einlogen und folgende Programme installieren:

Git, um das Repository einfach zu klonen:
```sh
sudo apt-get install git
```
NodeJS & NPM, alles läuft über ein NodeJS Skript::
```sh
sudo apt-get install nodejs
sudo apt-get install npm
```
Xorg, um den Chrome Browser anzeigen zu können:
```sh
sudo apt-get install xorg
```
unclutter, um den Mauszeiger zu enfernen:
```sh
sudo apt-get install unclutter
```
chromium, der Browser in dem der Einsatzmonitor läuft:
```sh
sudo apt-get install chromium-browser
```
pm2, der Prozessmanager für unsere NodeJS Anwendung:
```sh
npm install pm2 -g
```
cec-utils, wenn der Display über CEC gesteuert werden soll:
```sh
sudo apt-get install cec-utils
```
onoff, wenn der Display über CEC gesteuert werden soll:
```sh
npm install onoff
```

## Den Pi Einrichten

Als erstes müssen wir einen Auto-Login einrichten, dafür verwenden wir den Benutzer pi.
In der Datei:
```sh
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf 
```
folgenden Text einfügen:
```sh
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin pi --noclear %I 38400 linux
```
Beende den Editor mit ctrl+x und bestätige die Änderung mit y.
Nach einem Neustart sollte der Benutzer pi jetzt automatisch eingeloggt werden.
```sh
sudo reboot
```

## Das Projekt klonen

Wir wechseln in das Homeverzeichnis des pi Benutzer:
```sh
cd /home/pi/
```
Dort klonen wir uns das Github Repository mit:
```sh
git clone https://github.com/gubl/E-Monitor.git
```

#### Server Autostart

Im Home Verzeichnis die `.bash_profile` bearbeiten und folgendes einfügen:

```sh
nano .bash_profile
```

Inhalt:
```sh
while ! ping -c 1 -W 1 8.8.8.8; do
        echo "Wainting for connection..."
        sleep 1
done
echo "Online..."
pm2 start ./E-Monitor/server.js
sleep 2
[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx ./E-Monitor/startchrome.sh  -nocursor
```

Nach einem Neustart sollte der Pi nach dem automatischen Login zuerstet überprüfen ob eine Internet Verbindung besteht und danch das NodeJS Script mittels PM2 starten und danach den Xorg Server der im Chrome Browser die Startseite öffnet angezeigt werden.

Um den Browser zu schließen und zurück zur Console zu kommen einfach `Alt+F4` drücken.


## Benutzerdaten Konfigurieren

Im Projektordner `E-Monitor` ist eine config.json in der die Logindaten und die Parameter für die Display Standby Funktion hinterlegt:

```sh
{
  "isSet": true,
  "useCec": true,
  "useBtn": true,
  "useInfos": false,
  "data": {
    "username": "einsatzmonitor123",
    "password": "1234556",
    "customerId": "123123"
  },
  "btn": {
    "btnGpioPin": 517,
    "btnDelay": 7200000,
  },
  "displayCec": {
    "cecAddress": 0,
    "alarmDelta": 7200000,
    "requestInterval": 30000,
  }
}
```

- **isSet:** Flag ob die Logindaten hinterlegt sind (`true` wenn `data.username`, `data.password` & `data.customerId` eingetragen sind)
- **useSec:** `true`, wenn die Standby Funktion genutzt wird
- **useBtn:** `true`, wenn die Standby Funktion genutzt & ein Taster angeschlossen wird
- **useInfos:** `true`, wenn bei neuen Infos (nicht nur Alarme) der Display aus dem Standby kommen soll (nur mit CEC Funktion relevant)
- **data.username:** Benutzername / Einsatzmonitor Name
- **data.password:** Passwort (Auchtung es wird unverschlüsselt gespeichert!)
- **data.customerId:** Kundennummer des BlaulichtSMS Kunden
- **btn.btnGpioPin:** Der GPIO Pin am Pi an dem der Button angeschlossen ist (siehe dazu weiter unten Taster konfigurieren)
- **btn.btnDelay:** Zeit die der Display aus dem Standby geholt wird bei einem Tastendruck in ms
- **displayCec.cecAddress:** Adresse des CEC Geräts (nur mit CEC Funktion relevant)
- **displayCec.alarmDelta:** Zeit in ms was der Display aktiv ist nach einem Einsatz (nur mit CEC Funktion relevant)
- **displayCec.requestInterval:** Intervall in ms in der die Alarm API nach neuen Alarmen oder Infos abgefragt wird (nur mit CEC Funktion relevant)





## CEC / Display Standby konfigurieren

Mit folgendem Befehl werden alle CEC-fähigen Geräte angezeigt:
```sh
echo "scan" | cec-utils -s- d 1
```

In der Geräteliste steht hier die Adresse:

FOTO ADRESSE

Diese dann im config.json File eintragen zusammen mit allen anderen relevanten Parameter

## CEC / Display Standby konfigurieren

Mit folgendem Befehl werden alle CEC-fähigen Geräte angezeigt:
```sh
echo "scan" | cec-utils -s- d 1
```

In der Geräteliste steht hier die Adresse:

```sh
pi@raspberrypi:~/E-Monitor$ echo "scan" | cec-client -s -d 1
opening a connection to the CEC adapter...
requesting CEC bus information ...
CEC bus information
===================
device #1: Recorder 1           <--- #1 = Geräte Nummer 1 (diese im config File eintragen )
address:       1.0.0.0
active source: no
vendor:        Pulse Eight
osd string:    CECTester
CEC version:   1.4
power status:  on
language:      eng
```

Die device # dann in der `config.json` Datei eintragen, zusammen mit allen anderen relevanten Parameter, wie oben beschrieben.

## Taster konfigurieren

Mit folgendem Befehl werden die GPIO Adressen des Pis angezeigt, die wir im config File eintragen müssen:
```sh
cat /sys/kernel/debug/gpio
```
Output:
```sh
pi@raspberrypi:~/E-Monitor$ cat /sys/kernel/debug/gpio
gpiochip0: GPIOs 512-565, parent: platform/3f200000.gpio, pinctrl-bcm2835:
 gpio-512 (ID_SDA              )
 gpio-513 (ID_SCL              )
 gpio-514 (GPIO2               )
 gpio-515 (GPIO3               )
 gpio-516 (GPIO4               )                                    <-- für den GPIO Pin 4 muss 516 im config File eingetragen werden
 gpio-517 (GPIO5               |sysfs               ) in  lo IRQ 
 gpio-518 (GPIO6               )
 gpio-519 (GPIO7               )
 gpio-520 (GPIO8               )
 gpio-521 (GPIO9               )
 gpio-522 (GPIO10              )
```
Übersicht der Pin Header Belegung der Pis:

https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#schematics-and-mechanical-drawings

In den Schematics Dateien ist der GPIO Header abgebildet.

Der Taster wird an den GPIO Eingangspin über einem 1k Ohm Wiederstand und an Masse mit einem 10k Ohm WIederstand angeschlossen. Der andere Kontakt des Schließers wird an 3.3V angeschlossen.



