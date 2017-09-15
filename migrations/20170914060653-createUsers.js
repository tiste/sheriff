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
        db.createTable('users', {
            access_token: 'string',
            provider: 'string',
            token: { type: 'string', unique: true },
            user_id: 'string',
        }),
    ]).then(() => {
        return Promise.all([
            db.addIndex('users', 'provider_user_id', ['provider', 'user_id'], true),
        ]);
    });
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    version: 1,
};
