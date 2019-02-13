'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    hb7television = require(path.resolve('./modules/hb7television/server/controllers/hb7television.server.controller'));
var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function(app) {

    //todo: per keto routes dhe per push te tjera, permission????
    app.route('/api/hb7television')
        .get(hb7television.list)
        .post(hb7television.list)
    app.route('/api/hb7television/events')
        .post(hb7television.listevent)
        //.post(hb7television.create);
    app.route('/api/hb7television/upload')
        //.all(policy.isAllowed)
        .post(multipartyMiddleware, hb7television.upload);
};
