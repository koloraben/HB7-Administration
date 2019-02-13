"use strict";

module.exports = function(sequelize, DataTypes) {
    var channel_video_day = sequelize.define('channel_video_day', {

    },{
        tableName: 'channel_video_day',
        associate:function (model) {
            channel_video_day.belongsTo(model.channel_video)
            channel_video_day.belongsTo(model.channel_day)
        }
    });
    return channel_video_day;
};
