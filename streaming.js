var moment = require('moment');
const fs = require('fs')
const ffprob = require('ffprobe-client')
var spawn = require('child_process').spawn;
const playlistFolderRoot = '/playlists';
let currentDate = moment().format('DD-MM-YYYY')
var day = currentDate.substring(0, 2);
var month = currentDate.substring(3, 5);
var year = currentDate.substring(6, 10);
var playlistFile = playlistFolderRoot + '/' + year + '/' + month + '/' + day + '/' + year + '-' + month + '-' + day + '.txt'
var fillVideo = '/fill1.txt';
var server = 'rtmp://127.0.0.1/LiveApp/782223127085471305859179';
try {
    if (fs.existsSync(playlistFile)) {
        console.log('try to start playlist :', playlistFile)
        publishStreamFN(playlistFile, server)
    } else {
        fillStreamFN(fillVideo, server);
    }
} catch (err) {
    fillStreamFN(fillVideo, server);
}

function fillStreamFN(fillVideo, server) {
    var args = ['-re', '-f', 'concat', '-safe', '0', '-i', fillVideo, '-c', 'copy', '-f', 'flv', server]
    console.log(' command fill video ::', 'ffmpeg ' + args.join(" "));
    var fillStream = spawn('ffmpeg', args);
    console.log('start fill video :', fillVideo)
    fillStream.stderr.on('data', (data) => {
        console.error(` fillStream :\n${data}`);
    });
    fillStream.on('close', function (code, signal) {
        setTimeout(fillStreamFN(fillVideo, server), 3000);

    })

}

function publishStreamFN(fileName, server) {
    var args = ['-re', '-f', 'concat', '-safe', '0', '-i', fileName, '-c', 'copy', '-f', 'flv', server]
    console.log(' command play playlist ::', 'ffmpeg ' + args.join(" "));
    var playlistStream = spawn('ffmpeg', args)
    playlistStream.stderr.on('data', (data) => {
        console.error(` playlistStream child stderr:\n${data}`);
    });
    console.log('start playlist :', playlistFile)
    playlistStream.on('close', function (code, signal) {

        console.log('playlistStream process terminated due to receipt of signal ' + signal + ' and code ' + code);
        console.info(' publish end  playlist :' + playlistFile)
        fillStreamFN(fillVideo, server);
        //publishStreamFN(fileName, server)
    })
}