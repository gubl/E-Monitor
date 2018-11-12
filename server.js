const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const request = require('request');

const API_URL = "https://api.blaulichtsms.net/blaulicht";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/'));

app.get('/login',function(req,res){
    let raw_data = fs.readFileSync('./config/config.json');
    let config = JSON.parse(raw_data);

    if(config.isset) {
      let req = {
          "username" : config.data.username,
          "password" : config.data.password,
          "customerId" : config.data.customerId
      }

      headers = {
        "content-type" : "application/json"
      }

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
    }
    else {
      response = {
        "res": false,
        "sessionId": null,
        "error": "NO_CONFIG"
      }

      res.json(response);
    }
});

app.post('/register',function(req,res){
    let data = req.body;
    let response = {
      "res": false,
      "sessionId": null,
      "error": null
    }

    headers = {
      "content-type" : "application/json"
    }

    request({
      url: API_URL+"/api/alarm/v1/dashboard/login",
      method: 'POST',
      json: data
    }, function(error, response, body){
      console.log(body);
      if(error == null) {
        response = {
          "res": body.success,
          "sessionId": body.sessionId,
          "error": body.error
        }
        if(body.success) {
          conf_data = {
            "isset": true,
            "data": {
              "username": data.username,
              "password": data.password,
              "customerId": data.customerId
            }
          }
          conf_data = JSON.stringify(conf_data, null, 2);
          try {
            fs.writeFileSync('./config/config.json', conf_data);
          }
          catch (e) {
            response = {
              "res": false,
              "sessionId": null,
              "error": "ERROR_FILE"
            }
          }
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

app.listen(4000, 'localhost');
