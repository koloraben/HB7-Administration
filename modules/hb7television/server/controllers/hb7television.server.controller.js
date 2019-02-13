var fs = require('fs'),
    mkdirp = require('mkdirp'),
    moment = require('moment'),
    ConfigParser = require('configparser'),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    Op = require(path.resolve('./config/lib/sequelize')).sequelize.Op,
    DBModel = db.channel_day;
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
        if(channel_day.channel_videos)
            var broadcast_day = new Date(channel_day.broadcast_day);
        console.log("bbbbbbbbb : ",broadcast_day)
        console.log("brooo :" , channel_day.channel_videos.length)
        for (const channel_video of channel_day.channel_videos) {
            var event={}
            event.id = channel_video.id
            event.text = channel_video.title
            broadcast_day.setSeconds(channel_video.begin);
            event.start = moment(broadcast_day).format('YYYY-MM-DDTHH:mm:ss').toString()
            broadcast_day = new Date(channel_day.broadcast_day)
            console.log("start : ",event.start)
            broadcast_day.setSeconds(parseInt(channel_video.begin)+Math.floor(parseFloat(channel_video.dur)))
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

exports.list = function(req, res) {
    res.send()
};
exports.listevent = function(req, res) {
    var date = new Date(req.body.date);
    var searchStartDate = addDays(date,-4)
    var searchEndDate = addDays(date,4)
    DBModel.findAll({include: [ {model:db.channel_video} ],where:{broadcast_day:{$between:[searchStartDate,searchEndDate]}}}).then(function (result) {
        //console.log("////////////////",result[0],result[1])
        res.send(generateEvents(result))
    }).catch(function (err) {
        console.log('eroor db :',err)
    })
};
exports.upload = function uploadFile (req, res){
    console.log('req params : ', JSON.stringify(req.params))
    console.log('req files : ', JSON.stringify(req.files))
    /* get request and upload file informations */
    var tomodel = 'model';
    var tofield = 'field';
    var existingfile = path.resolve('./public'+req.app.locals.settings[tofield]);
    var fileName= req.files.file.name;
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

    makeDirectory(tempDirPath, function(){
        moveFile(tempPath, targetPath, function(err){
            if (err)
                res.json({err: 1, result: 'fail upload'});
            else

            if(tomodel == 'settings') {}
            else {
                res.json({err: 0, result: uploadLinkPath});
            }

        });
    });
}

