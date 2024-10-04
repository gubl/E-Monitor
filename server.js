const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const request = require('request');
const { exec } = require('child_process');



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/'));

// config Daten
let configData = {
  "isSet": false,
  "useCec": false,
  "useBtn": false,
  "useInfos": false,
  "data": {
    "username": "",
    "password": "",
    "customerId": ""
  },
  "btn": {
    "btnGpioPin": 0,
    "btnDelay": 0
  },
  "displayCec": {
    "cecAddress": "0",
    "alarmDelta": 0,
    "requestInterval": 0,
  }
}
// Config Daten ENDE

// Taster Definition
let button = null;

// BlaulichtSMS API URL
const API_URL = "https://api.blaulichtsms.net/blaulicht";

// Timer / Intervall
let displayTimeout = null;

// Session
let sessionID = "";


// Read Config data
function readConfig() {
  try {
    let raw_data = fs.readFileSync('/home/pi/E-Monitor/config.json');
    let config = JSON.parse(raw_data);
    configData = config;
    initTaster();
  }
  catch (e) {
    console.log(e);
  }
}
// Read Config data ENDE

// Write Config data
function writeConfig() {
  let dataJSON = JSON.stringify(configData, null, 2);
  try {
    fs.writeFileSync('/home/pi/E-Monitor/config.json', dataJSON);
  }
  catch (e) {
    response = {
      "res": false,
      "sessionId": null,
      "error": "ERROR_FILE"
    }
  }
}
//Write Config data ENDE

//Init Taster
function initTaster() {
  if(configData.useBtn && button == null) {
    const Gpio = require('onoff').Gpio;

    button = new Gpio(configData.btn.btnGpioPin, 'in', 'rising', { debounceTimeOut: 40 });

    button.watch((err, value) => {
      if(err) {
       console.log("Error with button");
       return;
      }
      display(true);
    });
  }
}
//Init Taster ENDE


// Alarm Abfrage-Intervall
const interval = setInterval(async () => {
  const alarms = await reqalarms(); // request alarma and inofs
  if(alarms != null) {
    alarms.forEach(function(alarm) {
      const alarm_datetime = new Date(alarm.alarmDate);
      const alarm_timestamp = alarm_datetime.getTime();
      const now_date = new Date();
      const now_timestamp = now_date.getTime();

      if(alarm_timestamp >= now_timestamp - configData.displayCec.alarmDelta) {
        display(false); // Display aktivieren
        return;
      }
    });
  }
  else {
    console.log("No alarms found.");
  }
}, configData.displayCec.requestInterval); // Abfrage Intervall
// Alarm Abfrage-Intervall ENDE

// Display ein-/ ausschalten
function display(btn) {
  //Display on
  const displayON = exec("echo 'on "+ configData.displayCec.cecAddress +"' | cec-client -s -d 1", function(err, stdout, stderr) {
   console.log(stdout);
  });
  if(displayTimeout) {
    clearTimeout(displayTimeout);
  }
  displayTimeout = setTimeout(() => {
    //Display standby
    const displayON = exec("echo 'standby "+ configData.displayCec.cecAddress +"' | cec-client -s -d 1", function(err, stdout, stderr) {
      console.log(stdout);
    });
  }, btn ? configData.btn.btnDelay : configData.displayCec.alarmDelta);                                                     // Zeit die der Display aktiv ist wenn der Taster gedrückt wurde oder wenn ein Alarm / Info rein kommt
}
// Display ein-/ ausschalten ENDE

// Alarm Abfrage
function reqalarms() {

    if(sessionID != "") {                                                       // Wurde bereits eine SessionId angefordert / ein Login durchgeführt?
      return new Promise(function (resolve, reject) {                           // Wenn ja, hol dir die letzten Alarme und Infos über die API
        request({
        url: API_URL+"/api/alarm/v1/dashboard/"+sessionID,
        method: 'GET',
      }, function(error, response, body){
        if(error == null) {
           const data = JSON.parse(body);
           if(configData.useInfos) {                                                       // Alarme und Infos anzeigen?
             resolve(data.alarms.concat(data.infos));
           }
           else {
             resolve(data.alarms);
           }
        }
        else {
          console.log(error);
          reject(error);
        }
      });
     });
    }
    else {
      login();                                                                   // Wenn nicht, mach den login und versuchs beim nächsten mal
      return null;
    }
}
// Alarm Abfrage ENDE

// Login Funktion (über die Dashboard API)
function login() {

    if(configData.isSet) {                                                          // Überprüfe ob in der config Datein passt
      let req = {
          "username" : configData.data.username,
          "password" : configData.data.password,
          "customerId" : configData.data.customerId
      }

      return new Promise(function(resolve, reject) {
      request({
        url: API_URL+"/api/alarm/v1/dashboard/login",
        method: 'POST',
        json: req
      }, function(error, response, body){
        console.log(body);
        if(error == null) {
          response = {
            "res": body.success,
            "sessionId": body.sessionId,
            "error": body.error
          }
          sessionID = response.sessionId;
        }
        else {
          console.log(error);
          response = {
            "res": false,
            "sessionId": null,
            "error": "ERROR_REQ"
          }
        }
        resolve(response);
      });
     });
    }
    else {
      response = {
        "res": false,
        "sessionId": null,
        "error": "NO_CONFIG"
      };
      console.log("No config...");
      resolve(response);
    }
}
// Login Funktioon ENDE

// Login
app.get('/login',async function(req,res) {
      const response = await login();
      res.json(response);
});
// Login ENDE

// Register
app.post('/register',function(req,res){
    let data = req.body;
    let response = {
      "res": false,
      "sessionId": null,
      "error": null
    }

    request({
      url: API_URL+"/api/alarm/v1/dashboard/login",
      method: 'POST',
      json: data
    }, function(error, response, body){
      if(error == null) {
        response = {
          "res": body.success,
          "sessionId": body.sessionId,
          "error": body.error
        }
        if(body.success) {
          configData.isSet = true;
          configData.data.username = data.username;
          configData.data.password = data.password;
          configData.data.customerId = data.customerId;
          sessionID = body.sessionId;
        }
      }
      else {
        console.log(error);
        response = {
          "res": false,
          "sessionId": null,
          "error": "ERROR_REQ"
        }
      }
      res.json(response);
    });
});
// Register ENDE

// Timer Abbrechen beim Beenden des Scripts
app.on("SIGINT", () => {
    clearInterval(interval);
    if(displayTimeout) {
        clearTimeout(displayTimeout);
    }
    process.exit(0);
});
// Timer ENDE

app.listen(4000, 'localhost', function () {
  console.log('###!### App listen on localhost:4000');
  readConfig();
});
