var fs = require('fs'),
    mkdirp = require('mkdirp'),
    convert = require('xml-js');
moment = require('moment'),
    https = require('https'),
    async = require('async'),
    ConfigParser = require('configparser'),
    fprobeClient = require('fluent-ffmpeg'),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.channel_day,
    DBModelChannelVideo = db.channel_video,
    DBModelChannelVideoDay = db.channel_video_day,
    DBModelChannel = db.channels,
    config = new ConfigParser();
//config.read('/etc/ffplayout/ffplayout.conf');
//var playlistFolder=config.get("PLAYLIST","playlist_path")?config.get("PLAYLIST","playlist_path"):'/playlists';
var playlistFolder = '/playlists';

function moveFile(sourcePath, destPath, cb){
    copyFile(sourcePath, destPath, cb, true);
}

function copyFile(sourcePath, destPath, cb, moveFlag){
    var source = fs.createReadStream(sourcePath);
    var dest = fs.createWriteStream(destPath);
    source.pipe(dest);
    source.on('end', function() {
        if (moveFlag)
            fs.unlinkSync(sourcePath);

    });
    cb();
    //source.on('error', function(err) { cb(err)});
}


function deleteFile(filePath)
{
    for(var i=0;i<filePath.length;i++)
    {
        var Path=path.resolve('./public'+filePath[i]);
        fs.unlink(Path,function (err) {
            //todo: do sth on error?
        });
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setHours(0,0,0,0)
    result.setDate(result.getDate() + days);
    return result;
}

function get_file_extention(fileName){
    if (fileName.indexOf('.')>-1){
        var splitlist = fileName.split('.');
        return '.' + splitlist[splitlist.length -1];
    }
    else return '';
}

function declineUpload (){

}

exports.list = function(req, res) {


    res.send([])
};
exports.create = function (req, res) {

            var tomodel = 'model';
            var tofield = 'field';
            var jsonPlaylist = {
                    "channel": "",
                    "author": "",
                    "title": "",
                    "date": "",
                    "length": "24:00:00.000",
                    "program": []
                };
            async.forEachOf(req.files.file, function (value, i, callback1) {
                req.files.file[i].ads=req.body.file[i].ads
                req.files.file[i].order=req.body.file[i].order
                callback1()
            }, function (err) {
                if (err) console.error(err.message);
                console.log(JSON.stringify(req.files.file))
                var day =req.body.details.channelDay.broadcast_day.substring(0, 2);
                var month =req.body.details.channelDay.broadcast_day.substring(3, 5);
                var year =req.body.details.channelDay.broadcast_day.substring(6, 10);
                var jsonPlaylistDayFolder = '/' + year + '/' + month+ '/' + day;
                var jsonDayFile = year + '-' + month+ '-' + day;
                var jsonDayExt = '.json';
                mkdirRecursiveSync( playlistFolder + jsonPlaylistDayFolder)
                var videos=[];
                jsonPlaylist.author = req.body.details.channelDay.author?req.body.details.channelDay.author:""
                jsonPlaylist.title = req.body.details.channelDay.title?req.body.details.channelDay.title:""
                jsonPlaylist.date = req.body.details.channelDay.broadcast_day?req.body.details.channelDay.broadcast_day:""

                async.forEach(req.files.file, function (file, callback) {

                    var fileName= file.file.name;
                    var fileExtension = get_file_extention(fileName);
                    var tempPath = file.file.path;
                    var tempDirPath = path.resolve('./public/files/'+tomodel);
                    var uploadLinkPath = jsonPlaylistDayFolder + '/' + fileName.replace(fileExtension, '').replace(/[^0-9a-z]/gi, '')+fileExtension;
                    var targetPath =  playlistFolder + uploadLinkPath;
                    {
                        console.log('tempPath ////////////////// :' , tempPath)
                        fprobeClient.ffprobe(tempPath, function(err, data) {
                            if(err){
                                console.error('ffprob error : ',err)
                                res.json({err: 1, result: 'fail upload, ffprobe'});
                            }
                            else{
                                var duree = parseFloat(data.format.duration);
                                var video = {
                                    description: '',
                                    absolute_path: targetPath,
                                    title: fileName.split('.').slice(0, -1).join('.'),
                                    ads:file.ads,
                                    dur: duree,
                                    in: 0,
                                    out: duree,
                                    order:file.order,
                                };
                                DBModelChannelVideo.create(video)
                                    .then(function (videoCreated) {
                                        videos.push({
                                            "id": videoCreated.id,
                                            "source": video.absolute_path,
                                            "duration": video.dur,
                                            "in": video.in,
                                            "out": video.out,
                                            "order":video.order
                                        })
                                        moveFile(tempPath, targetPath, function(err){
                                            if (err){
                                                // res.json({err: 1, result: 'fail upload, file system error'});

                                            }
                                            else  {

                                            }          });

                                        callback();
                                    })
                                    .catch(function (err) {
                                        declineUpload()
                                        console.error('error DB : ',err)
                                        res.json({err: 1, result: 'fail upload,db error'});
                                    })
                            }
                        })

                    }


                }, function (err) {
                    videos.sort(((a, b) => parseInt(a.order)-parseInt(b.order)))
                    console.log('videos sorting :' , videos)
                    req.body.details.channelDay.broadcast_day = moment(req.body.details.channelDay.broadcast_day,"DD-MM-yyyy")
                    var channelDay = req.body.details.channelDay;
                    DBModel.findAll({
                        where: {
                            broadcast_day: req.body.details.channelDay.broadcast_day
                        }
                    }).then(function (channelDays) {
                        if(channelDays.length>0){
                            DBModel.destroy({where: {id: channelDays[0].id}})
                                .then(function (success) {
                                    console.info("success db destroy",err)
                                    deleteDirectory();
                                    DBModel.create(channelDay).then(function (channelDay) {
                                        let dayProgramme = {
                                            "channel": "live HB7 programmé le : " + jsonDayFile,
                                            "date": "" + jsonDayFile,
                                            "program": videos
                                        };
                                        dayProgramme.program=videos;

                                        let playlist="";
                                        let size = videos.length;
                                        for(let i=0;i<size;i++){
                                            if(i == size-1)playlist+="file '"+videos[i].source+"'"
                                            else playlist+="file '"+videos[i].source+"'\n"
                                        }
                                        fs.writeFile(playlistFolder + jsonPlaylistDayFolder +'/'+ jsonDayFile + jsonDayExt, JSON.stringify(dayProgramme), function(err) {
                                            if(!err){
                                                var VideoDay = []
                                                for(let i in videos){
                                                    VideoDay.push({channelDayId	:channelDay.id,channelVideoId:videos[i].id});
                                                }
                                                DBModelChannelVideoDay.bulkCreate(VideoDay, {returning: true})
                                                    .then((videos) => { // Notice: There are no arguments here, as of right now you'll have to...
                                                        res.send() // ... in order to get the array of user objects
                                                    }).then(DBModelChannelVideoDay => {

                                                })
                                            }
                                            if(err) {
                                                return console.error(err);
                                            }
                                        })
                                    },function (err) {
                                        console.error("error db ",err)
                                    })
                                },function (error) {
                                    console.error("error db destroy",err)
                                })
                        }else {
                            DBModel.create(channelDay).then(function (channelDay) {
                                let dayProgramme = {
                                    "channel": "live HB7 programmé le : " + jsonDayFile,
                                    "date": "" + jsonDayFile,
                                    "program": videos
                                };

                                let playlist="";
                                let size = videos.length;
                                for(let i=0;i<size;i++){
                                    if(i == size-1)playlist+="file '"+videos[i].source+"'"
                                    else playlist+="file '"+videos[i].source+"'\n"
                                }
                                fs.writeFile(playlistFolder + jsonPlaylistDayFolder +'/'+ jsonDayFile + jsonDayExt, JSON.stringify(dayProgramme), function(err) {
                                    if(!err){
                                        var VideoDay = []
                                        for(let i in videos){
                                            VideoDay.push({channelDayId	:channelDay.id,channelVideoId:videos[i].id});
                                        }
                                        DBModelChannelVideoDay.bulkCreate(VideoDay, {returning: true})
                                            .then((videos) => { // Notice: There are no arguments here, as of right now you'll have to...
                                                res.send() // ... in order to get the array of user objects
                                            }).then(DBModelChannelVideoDay => {

                                        })
                                    }
                                    if(err) {
                                        return console.error(err);
                                    }
                                })
                            },function (err) {
                                console.error("error db ",err)
                            })
                        }
                    },function (err) {
                        res.status(500).end()
                    });
                });

                function mkdirRecursiveSync(path) {
                    if(fs.existsSync(path))deleteDirectory(path)
                    let paths = path.split('/');
                    let fullPath = '';
                    paths.forEach((path) => {
                        if(path!==""){
                            if (fullPath === '') {
                                fullPath = '/'+path;
                            } else {
                                fullPath = fullPath + '/' + path;
                            }

                            if (!fs.existsSync(fullPath)) {
                                fs.mkdirSync(fullPath,function (err) {
                                    if(err) console.log("ERRROOO :: ",err)
                                });
                            }
                        }

                    });
                };

                function deleteDirectory(dirPath) {
                    try { var files = fs.readdirSync(dirPath); }
                    catch(e) { return; }
                    if (files.length > 0)
                        for (var i = 0; i < files.length; i++) {
                            var filePath = dirPath + '/' + files[i];
                            if (fs.statSync(filePath).isFile())
                                fs.unlinkSync(filePath);
                            else
                                rmDir(filePath);
                        }
                };
            })
}






exports.listChannel = function (req, res) {

    var resultChannel = {
        "hb7livetv":[
            {
                "category":"live",
                "videos":[]
            }
        ]
    }

    DBModelChannel.findAll(
        {
            include:[
                {
                    model:db.channel_stream,
                    required:true
                }
            ],
            order : [['channel_number', 'ASC']]
        }).then(function (result){
        console.log("req.pro . host", req.protocol + '://' + req.host )
        async.forEach(result,function (channelDB,callback) {
            var channel = {
                "description":channelDB.description,
                "sources":channelDB.channel_streams[0].stream_url?channelDB.channel_streams[0].stream_url:"",
                "card":"http://188.165.194.82:8001"+channelDB.icon_url,
                "background":"http://188.165.194.82:8001"+channelDB.background,
                "title":channelDB.title,
                "order":channelDB.channel_number,
                "currentProg":""
            }
            if(channelDB.title.startsWith("HB7")){
                getProgramme().then(value => {
                    channel.currentProg=value;
                    resultChannel.hb7livetv[0].videos.push(channel)
                    callback()
                }).catch(reason => {
                    resultChannel.hb7livetv[0].videos.push(channel)
                    console.error("no current programme")
                    callback()
                })


            }else {
                const options = {
                    "method": "GET",
                    "hostname": "ns372429.ip-188-165-194.eu",
                    "port": 443,
                    "path": encodeURI("/api/epg/events/grid?channel="+channelDB.title+"&mode=now"),
                    "headers": {}
                }
                const reqest = https.request(options, function(res) {

                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function() {
                        var body = Buffer.concat(chunks);
                        var response = JSON.parse(body);
                        if(response["entries"].length==1 && response["entries"][0].hasOwnProperty("start"))
                        {
                            console.log("###########################")
                            console.log(channel.title)
                            console.log(response["entries"][0].start)
                            console.log("##########################")

                            channel.currentProg=formatCurrentProg(response["entries"][0].start,response["entries"][0].stop,response["entries"][0].title)

                        } });
                    resultChannel.hb7livetv[0].videos.push(channel)
                    callback()
                });
                reqest.end()
            }


        },function (err) {
            res.json(resultChannel)
        })
    })
}
function formatCurrentProg(start,stop,title) {
    var start = new Date(start * 1000).toLocaleTimeString('fr-FR', { hour: 'numeric', minute: 'numeric', hour12: false });
    var stop = new Date(stop * 1000).toLocaleTimeString('fr-FR', { hour: 'numeric', minute: 'numeric', hour12: false });
    return start +"<>"+stop +" "+ title
}
function getProgramme() {
    return new Promise((resolve, reject) => {
        var dbdate = new Date();dbdate.setHours(0,0,0,0);
        DBModel
            .findAll({
                include:[ {model:db.channel_video} ],
                where:{broadcast_day:{$in:[dbdate]}}})
            .then(function (result) {
                var event = generateEvents(result)
                var element = findCurrent(event);
                if(element && element!=null) resolve(formatCurrentProg(new Date(element.start),new Date(element.end),element.text));
                else reject(null);
            })
            .catch(function (err) {
                reject(null)
                console.error('eroor db :',err)
            })
    });


};
function findCurrent(events) {
    var date = new Date();
    if(events && events.length>0)
        for (const element of events){
            if (new Date(element.start)<=date && date<=new Date(element.end))
                return element
        }
    return null;

}
function generateEvents(result) {
    var start = 28800;
    let events = []
    for (const channel_day of result) {
        channel_day.channel_videos.sort(((a, b) => parseInt(a.order)-parseInt(b.order)))
        if(channel_day.channel_videos) var broadcast_day = new Date(channel_day.broadcast_day);
        for (const channel_video of channel_day.channel_videos) {
            var event={}
            event.id = channel_video.id
            event.text = channel_video.title
            broadcast_day.setSeconds(start);
            start += Math.floor(parseFloat(channel_video.dur));
            event.start =  moment(broadcast_day).format('YYYY-MM-DDTHH:mm:ss').toString()
            broadcast_day = new Date(channel_day.broadcast_day)
            console.log("start : ",event.start)
            broadcast_day.setSeconds(start)
            event.end = moment(broadcast_day).format('YYYY-MM-DDTHH:mm:ss')
            broadcast_day = new Date(channel_day.broadcast_day)
            event.description = channel_video.description
            event.absolutPath = channel_video.absolute_path
            event.duration = channel_video.dur
            event.dateBroadcast = broadcast_day
            events.push(event)
        }
    }
    return events;
}