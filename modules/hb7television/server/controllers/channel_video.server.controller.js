var fs = require('fs'),
    mkdirp = require('mkdirp'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    async = require('async'),
    ConfigParser = require('configparser'),
    fprobeClient = require('ffprobe-client'),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    Op = require(path.resolve('./config/lib/sequelize')).sequelize.Op,
    DBModel = db.channel_day,
    DBModelChannelVideo = db.channel_video,
    DBModelChannelVideoDay = db.channel_video_day,
    playlistFolder='/playlist'

var folder;

function makeDirectory(dirName, cb){
    if (!fs.existsSync(dirName)){
        mkdirp(dirName, function(err){
            cb(err);
        })
    } else {
        cb()
    }
}

/*function takes a basepath and a custompath.
Basepath is the url of the CDN+'public'.
Custompath is the relative path of the file, same url that will be stored to the database
For each hierarchy level, it checks if path exists. If not, creates folder.
 */
function mkdir_recursive(basepath, custompath){
    var fullpath = basepath;
    for(var i = 0; i< custompath.split('/').length-1; i++){ //length-1 makes sure that the filename itself is not included in the path creation
        fullpath = fullpath + custompath.split('/')[i]+'/';
        if (!fs.existsSync(fullpath)) {
            mkdirp(fullpath, function(err){
                //todo: return some response?
            });
        }
    }
}

function moveFile(sourcePath, destPath, cb){
    copyFile(sourcePath, destPath, cb, true);
}

function copyFile(sourcePath, destPath, cb, moveFlag){
    var source = fs.createReadStream(sourcePath);
    var dest = fs.createWriteStream(destPath);
    source.pipe(dest);
    source.on('end', function() {
        if (moveFlag)
            fs.unlink(sourcePath);
        cb();
    });
    source.on('error', function(err) { cb(err)});
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

function generateEvents(result) {
    let events = []
    for (const channel_day of result) {
        result.length
        if(channel_day.channel_videos)
            var broadcast_day = new Date(channel_day.broadcast_day);
        console.log("brooo :" , channel_day.channel_videos.length)
        for (const channel_video of channel_day.channel_videos) {
            var event={}
            event.id = channel_video.id
            event.text = channel_video.title
            broadcast_day.setSeconds(channel_video.begin);
            event.start = broadcast_day.toISOString()
            broadcast_day.setSeconds(parseFloat(channel_video.begin)+parseFloat(channel_video.dur))
            event.end = broadcast_day.toISOString()
            event.description = channel_video.description
            event.absolutPath = channel_video.absolute_path
            event.duration = channel_video.dur
            event.dateBroadcast = broadcast_day
            events.push(event)
        }
    }
    return events;
}
function declineUpload (){

}

exports.list = function(req, res) {

    var date = new Date(req.body.date);
    DBModel.findAll({include: [ {model:db.channel_video} ],where:{broadcast_day:{$eq:[date]}}}).then(function (result) {
        console.log("////////////////",result[0],result[1])
        res.send((result))
    }).catch(function (err) {
        console.error('eroor db :',err)
    })

};
/*exports.upload = function uploadFile (req, res){

    /!* get request and upload file informations *!/
    var tomodel = 'model';
    var tofield = 'field';
    var existingfile = path.resolve('./public'+req.app.locals.settings[tofield]);
    console.log("req.files ",req.files.file)
    var fileName= req.files.file.name.replace(/ /g,"_");
    var fileExtension = get_file_extention(fileName);
    var tempPath = req.files.file.path;
    var tempDirPath = path.resolve('./public/files/'+tomodel);


    if(fileExtension === '.apk'){
        var uploadLinkPath = '/files/' + tomodel + '/' + fileName.replace(fileExtension, '').replace(/\W/g, '')+fileExtension; //apk file allows alphanumeric characters and the underscore. append timestamp to ensure uniqueness
    }
    else{
        var uploadLinkPath = '/files/' + tomodel + '/' + Date.now() + fileName.replace(fileExtension, '').replace(/[^0-9a-z]/gi, '')+fileExtension; //other file types allow only alphanumeric characters. append timestamp to ensure uniqueness
    }
    var targetPath = path.resolve('./public' + uploadLinkPath);


   /!* makeDirectory(tempDirPath, function(){
        moveFile(tempPath, targetPath, function(err){
            if (err)
                res.json({err: 1, result: 'fail upload, file system error'});
            else{
                console.log('targetPath :' , targetPath)
                fprobeClient(targetPath)
                    .then(data =>{
                        var duree = data.format.duration
                        var video = {
                            description: 'une description',
                            absolute_path: targetPath,
                            title: fileName,
                            begin: '',
                            dur: duree,
                            in: '0.00',
                            out: duree,
                            order:1
                        }
                        DBModelChannelVideo.create(video)
                            .then(function (videoCreated) {
                                res.json({err: 0, result: videoCreated});
                            })
                            .catch(function (err) {
                                declineUpload()
                                console.error('error DB : ',err)
                                res.json({err: 1, result: 'fail upload,db error'});
                            })
                    } )
                    .catch(err => {
                        console.error('ffprob error : ',err)
                        res.json({err: 1, result: 'fail upload, ffprobe'});
                    })
            }



        });
    });*!/


}*/

exports.create = function (req, res) {
    const fs = require('fs');
    const path = require('path');
    var tomodel = 'model';
    var tofield = 'field';

    for(var i=0;i<req.files.file.length;i++){
        req.files.file[i].ads=req.body.file[i].ads
    }
    console.log("req.req ",req.files.file)
    console.log("req.channelDay ",req.body.details.channelDay)
    console.log("broadcast_day ",req.body.details.channelDay.broadcast_day)
    var day =req.body.details.channelDay.broadcast_day.substring(0, 2);
    var month =req.body.details.channelDay.broadcast_day.substring(3, 5);
    var year =req.body.details.channelDay.broadcast_day.substring(6, 10);
    console.log("day",day)
    console.log("month",month)
    console.log("year",year)

    const mkdirSync = function (dirPath) {
        try {
            fs.mkdirSync(dirPath)
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
    const directoryPath = '/files/' + tomodel + '/' + year
    mkdirSync(path.resolve('./public'+ directoryPath))

    mkdirSync(path.resolve('./public'+ directoryPath + '/' + month))
    mkdirSync(path.resolve('./public'+ directoryPath + '/' + month+ '/' + day))
var videos=[]
    async.forEach(req.files.file, function (file, callback) {
        var fileName= file.file.name.replace(/ /g,"_");
        var fileExtension = get_file_extention(fileName);
        var tempPath = file.file.path;
        var tempDirPath = path.resolve('./public/files/'+tomodel);
        var uploadLinkPath = '/files/' + tomodel + '/' + year + '/' + month + '/' + day + '/' + fileName.replace(fileExtension, '').replace(/[^0-9a-z]/gi, '')+fileExtension;
        var targetPath = path.resolve('./public' + uploadLinkPath);

        makeDirectory(tempDirPath, function(){
            moveFile(tempPath, targetPath, function(err){
                if (err)
                    res.json({err: 1, result: 'fail upload, file system error'});
                else{
                    console.log('targetPath :' , targetPath)
                    fprobeClient(targetPath)
                        .then(data =>{
                            var duree = data.format.duration
                            var video = {
                                description: 'une description',
                                absolute_path: targetPath,
                                title: fileName,
                                begin: '',
                                ads:file.ads,
                                dur: duree,
                                in: '0.00',
                                out: duree,
                                order:1,
                                //ads:req.body.file[0].ads
                            }
                            DBModelChannelVideo.create(video)
                                .then(function (videoCreated) {
                                    //res.json({err: 0, result: videoCreated});
                                    videos.push(videoCreated)

                                    callback();
                                })
                                .catch(function (err) {
                                    declineUpload()
                                    console.error('error DB : ',err)
                                    res.json({err: 1, result: 'fail upload,db error'});
                                })
                        } )
                        .catch(err => {
                            console.error('ffprob error : ',err)
                            res.json({err: 1, result: 'fail upload, ffprobe'});
                        })
                }



            });
        });

    }, function (err) {


            const config = new ConfigParser();
            config.read(path.resolve('./ffplayout.conf'));
            var startSeconds =config.get("PLAYLIST","day_start")*3600
            req.body.details.channelDay.broadcast_day = moment(req.body.details.channelDay.broadcast_day,"DD-MM-yyyy")

            var channelDay = req.body.details.channelDay;
            DBModel.create(channelDay).then(function (channelDay) {
                var VideoDay = []
                var videoBegin = []
                for(let i in videos){
                    VideoDay.push({channelDayId	:channelDay.id,channelVideoId:videos[i].id});
                    videoBegin.push({id:videos[i].id,begin:startSeconds,order:videos[i].order})
                    startSeconds = startSeconds +Math.floor(parseFloat(videos[i].dur));
                }
                for(let j in videoBegin){
                    DBModelChannelVideo.findById(videoBegin[j].id).then(function (video) {
                        video.update({
                            begin:videoBegin[j].begin
                        }).then(function () {

                        })
                    })
                }
                console.log("VideoDay :", VideoDay)
                DBModelChannelVideoDay.bulkCreate(VideoDay)
                    .then(() => { // Notice: There are no arguments here, as of right now you'll have to...
                    }).then(DBModelChannelVideoDay => {
                    res.send() // ... in order to get the array of user objects
                })
            },function (err) {
                console.error("error db ",err)
            })


    });
/*for(var i=0;i<req.files.file.length;i++){
    var fileName= req.files.file[i].file.name.replace(/ /g,"_");
    var fileExtension = get_file_extention(fileName);
    var tempPath = req.files.file[i].file.path;
    var indice=req.files.file[i].ads
    var tempDirPath = path.resolve('./public/files/'+tomodel);
    var uploadLinkPath = '/files/' + tomodel + '/' + year + '/' + month + '/' + day + '/' + fileName.replace(fileExtension, '').replace(/[^0-9a-z]/gi, '')+fileExtension;
    var targetPath = path.resolve('./public' + uploadLinkPath);
    makeDirectory(tempDirPath, function(){
        moveFile(tempPath, targetPath, function(err){
            if (err)
                res.json({err: 1, result: 'fail upload, file system error'});
            else{
                console.log('targetPath :' , targetPath)
                fprobeClient(targetPath)
                    .then(data =>{
                        var duree = data.format.duration
                        var video = {
                            description: 'une description',
                            absolute_path: targetPath,
                            title: fileName,
                            begin: '',
                            ads:indice,
                            dur: duree,
                            in: '0.00',
                            out: duree,
                            order:1,
                            //ads:req.body.file[0].ads
                        }
                        DBModelChannelVideo.create(video)
                            .then(function (videoCreated) {
                                //res.json({err: 0, result: videoCreated});
                                 videos.push(videoCreated)
                                nbr--;
                                if(nbr==0){

                                    const config = new ConfigParser();
                                    config.read(path.resolve('./ffplayout.conf'));
                                    var startSeconds =config.get("PLAYLIST","day_start")*3600
                                    req.body.details.channelDay.broadcast_day = moment(req.body.details.channelDay.broadcast_day,"DD-MM-yyyy")

                                    var channelDay = req.body.details.channelDay;
                                    DBModel.create(channelDay).then(function (channelDay) {
                                        var VideoDay = []
                                        var videoBegin = []
                                        for(let i in videos){
                                            VideoDay.push({channelDayId	:channelDay.id,channelVideoId:videos[i].id});
                                            videoBegin.push({id:videos[i].id,begin:startSeconds,order:videos[i].order})
                                            startSeconds = startSeconds +Math.floor(parseFloat(videos[i].dur));
                                        }
                                        for(let j in videoBegin){
                                            DBModelChannelVideo.findById(videoBegin[j].id).then(function (video) {
                                                video.update({
                                                    begin:videoBegin[j].begin
                                                }).then(function () {

                                                })
                                            })
                                        }
                                        console.log("VideoDay :", VideoDay)
                                        DBModelChannelVideoDay.bulkCreate(VideoDay)
                                            .then(() => { // Notice: There are no arguments here, as of right now you'll have to...
                                            }).then(DBModelChannelVideoDay => {
                                            res.send() // ... in order to get the array of user objects
                                        })
                                    },function (err) {
                                        console.error("error db ",err)
                                    })
                                }
                            })
                            .catch(function (err) {
                                declineUpload()
                                console.error('error DB : ',err)
                                res.json({err: 1, result: 'fail upload,db error'});
                            })
                    } )
                    .catch(err => {
                        console.error('ffprob error : ',err)
                        res.json({err: 1, result: 'fail upload, ffprobe'});
                    })
            }



        });
    });
}*/


   // var existingfile = path.resolve('./public'+req.app.locals.settings[tofield]);





        //other file types allow only alphanumeric characters. append timestamp to ensure uniqueness













}

