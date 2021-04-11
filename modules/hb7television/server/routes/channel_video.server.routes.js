'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    channelVideo = require(path.resolve('./modules/hb7television/server/controllers/channel_video.server.controller'));
var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function(app) {

    app.route('/api/channel_video')
        .get(channelVideo.list)
        .post(multipartyMiddleware,channelVideo.create)

 app.route('/api/channelslive')
        .get(channelVideo.listChannel)
    /*app.route('/api/channel_video/upload')
    //.all(policy.isAllowed)
        .post( channelVideo.upload);*/
};
