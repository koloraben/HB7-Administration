const {spawn} = require('child_process');

const python = spawn('python', ['ffplayout.py']);


python.stdout.on('data', function (data) {

  console.log('Pipe data from ffplayout python script ...');

 });
 
 
  python.on('close', (code) => {
  
 console.log(`child process ffplayout close all stdio with code ${code}`);
 
 });