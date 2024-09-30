const nodemon = require('nodemon');
console.log('###!### Starting backend server...');
nodemon({
  script: 'server.js',
  ext: 'js json',
  ignore: [
    "*.js"
  ],
  watch: [
    "up"
  ]
});

nodemon.on('start', function () {
  console.log('###!### Server has started');
}).on('quit', function () {
  console.log('###!### Server has quit');
  process.exit();
}).on('restart', function (files) {
  console.log('###!### Server restarted due to: ', files);
});
