"use strict";

module.exports = function(sequelize, DataTypes) {
    var channel_day = sequelize.define('channel_day', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        title: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        author: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        broadcast_day: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'channel_day',
        associate: function(models) {
                channel_day.belongsToMany(models.channel_video,{
                        through: 'channel_video_day'
                    }
                    );
        }
    });
    return channel_day;
};