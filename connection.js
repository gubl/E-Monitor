/*
* Copyright(c) 2019 Gabriel Braun
*/
const internetAvailable = require("internet-available");

exports.connectionCheck = function() {

  setInterval(intervalFunc, 5000);
}

function intervalFunc() {
  internetAvailable({
    timeout: 1000,
}).then(function(){
    console.log("Internet available");
}).catch(function(){
    console.log("No internet");
});
}
