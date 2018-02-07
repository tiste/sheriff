'use strict';
/* eslint-disable no-unused-vars */

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    return Promise.all([
        db.addColumn('users', 'slack_url', { type: type.STRING }),
    ]);
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    version: 2,
};
