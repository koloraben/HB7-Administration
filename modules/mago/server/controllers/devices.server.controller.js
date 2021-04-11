'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.devices,
    DBModelLoginData = db.login_data;

/**
 * Create
 */
exports.create = function(req, res) {

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.genre);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.genre;

    updateData.updateAttributes(req.body).then(function(result) {
        res.json(result);
        return null;
    }).catch(function(err) {
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
        return null;
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.genre;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
        return null;
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * List
 */
exports.list = function(req, res) {

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.device_id = {};
        qwhere.$or.device_id.$like = '%'+query.q+'%';
        qwhere.$or.device_brand = {};
        qwhere.$or.device_brand.$like = '%'+query.q+'%';
        qwhere.$or.os = {};
        qwhere.$or.os.$like = '%'+query.q+'%';
    }

    final_where.where = qwhere;
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [];

    if(query.login_data_id) qwhere.login_data_id = query.login_data_id;
    if(query.device_active === 'true') qwhere.device_active = true;
    else if(query.device_active === 'false') qwhere.device_active = false;

    DBModel.findAndCountAll(

        final_where

    ).then(function(results) {
        if (!results) {
            res.status(404).send({
                message: 'No data found'
            });
            return null;
        } else {

            res.setHeader("X-Total-Count", results.count);
            return res.json(results.rows);
        }
    }).catch(function(err) {
        return res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: {
            id: id
        },
        include: []
    }).then(function(result) {
        if (!result) {
            res.status(404).send({
                message: 'No data with that identifier has been found'
            });
            return null;
        } else {
            req.genre = result;
            next();
            return null;
        }
    }).catch(function(err) {
        next(err);
        return null;
    });

};

exports.validateCode = function (req, res) {
    DBModel.findOne({
        where: {
            $or: [{

                device_mac_address: [req.query.macwlan0.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''),req.query.maceth0.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')]
            },{
        device_id: req.query.serial
            }
            ],
        }
    }).then(function (device) {
        if (!!device && device.device_active)
        {
            DBModelLoginData.findOne({
                where: {device_id: device.id}
            }).then(function (loginAccount) {
                console.error("code: " + req.query.code)
                console.error("loginAccount.account_lock : " + loginAccount.account_lock)
                console.error("loginAccount.code : " + loginAccount.code)
                if (!loginAccount.account_lock && loginAccount.code == req.query.code) {
                    res.json(loginAccount)
                } else res.sendStatus(401)
            })
        }else res.sendStatus(401)

    })
}