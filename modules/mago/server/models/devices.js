"use strict";

module.exports = function(sequelize, DataTypes) {
    var Devices = sequelize.define('devices', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        device_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        device_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        device_mac_address: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        device_brand: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        os: {
            type: DataTypes.STRING,
            allowNull: true
        },
        firmware: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        language: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'devices',
        associate: function(models) {
        }
    });
    return Devices;
};
