'use strict';

import hat from 'hat';
import { query } from '../../lib/pg';
import conf from '../../config/config';

export const FAKE_USER = {
    accessToken: '12345',
    provider: 'github',
    userId: 123,
    token: 'token',
    slackUrl: 'http://slack.com',
};

export function save(userId, provider, accessToken) {
    const token = hat();

    return query('INSERT INTO users(access_token, provider, user_id, token) VALUES($1, $2, $3, $4)', [accessToken, provider, userId, token]).then(() => {
        return {
            accessToken,
            provider,
            userId,
            token,
        };
    });
}

export function updateToken(userId, provider, accessToken, token) {

    return query('UPDATE users SET access_token = $1 WHERE user_id = $2 AND provider = $3', [accessToken, userId, provider]).then(() => {
        return {
            accessToken,
            provider,
            userId,
            token,
        };
    });
}

export function update(slackUrl, token) {

    return query('UPDATE users SET slack_url = $1 WHERE token = $2 RETURNING *', [slackUrl, token]).then(({ rows }) => {
        return {
            slackUrl: rows[0].slack_url,
        };
    });
}

export function login(token) {

    return query('SELECT * FROM users WHERE token = $1', [token]).then(({ rows }) => {
        if (!rows[0]) {
            throw new Error('The user does not exist');
        }

        return {
            accessToken: rows[0].access_token,
            provider: rows[0].provider,
            userId: rows[0].user_id,
            token: rows[0].token,
            slackUrl: rows[0].slack_url,
        };
    });
}

export function ensureAuthenticated(req, res, next) {
    if (conf.get('NODE_ENV') !== 'production') {
        req.user = FAKE_USER;
        return next();
    }

    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}
