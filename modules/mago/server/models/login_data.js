"use strict";
var path = require('path');
var authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller'));
var login_data_ctrl = require(path.resolve('./modules/deviceapiv2/server/controllers/credentials.server.controller'));

module.exports = function(sequelize, DataTypes) {
    var loginData = sequelize.define('login_data', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        customer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        device_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        account_lock: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        code: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
    }, {
        tableName: 'login_data',
        associate: function(models) {
            if (models.customer_data){
                loginData.belongsTo(models.customer_data, {foreignKey: 'customer_id'});
            }
            if (models.devices){
                loginData.belongsTo(models.devices, {foreignKey: 'device_id'});
            }
        }
    });


    return loginData;
};
