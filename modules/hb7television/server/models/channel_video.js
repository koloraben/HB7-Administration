"use strict";

module.exports = function(sequelize, DataTypes) {
    var channel_video = sequelize.define('channel_video', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        order: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        absolute_path: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
        ,
        begin: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        dur: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        in: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        out: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: 'channel_video',
        associate: function(models) {
            if(models.channel_day){
                channel_video.belongsToMany(models.channel_day, {through: 'channel_video_day'});
            }
        }
    });
    return channel_video;
};
