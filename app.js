'use strict';

import express from 'express';
import conf from './config/config';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalAPIKeyStrategy } from 'passport-localapikey';
import { Strategy as GitHubStrategy } from 'passport-github';
import { query } from './lib/pg';
import * as userService from './lib/userService';

import { router as githubRouter } from './routes/github';

const app = express();
const server = require('http').Server(app);


// configure modules

console.log(`Current env: ${conf.get('NODE_ENV')}`); // eslint-disable-line no-console

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new LocalAPIKeyStrategy({ apiKeyField: 'token' }, (token, done) => {

    userService.login(token).then((user) => {

        return done(null, user);
    }).catch((e) => done(e, false));
}));

passport.use(new GitHubStrategy({
    clientID: conf.get('GITHUB_APP_CLIENT_ID'),
    clientSecret: conf.get('GITHUB_APP_SECRET_ID'),
}, (accessToken, refreshToken, profile, done) => {

    query('SELECT * FROM users WHERE user_id = $1 AND provider = $2', [profile.id, 'github']).then(({ rows }) => {
        if (!rows[0]) {
            return userService.save(profile.id, 'github', accessToken).then((user) => {

                return done(null, user);
            }).catch((e) => done(e, false));
        }

        userService.update(profile.id, 'github', accessToken, rows[0].token).then((user) => {

            return done(null, user);
        }).catch((e) => done(e, false));
    }).catch((e) => done(e, false));
}));


// configure express middleware

app.set('view engine', 'pug');
app.set('trust proxy', true);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());


// routes

// app

app.use('/github', githubRouter);

app.get('/login', (req, res) => {

    res.redirect('/github/login');
});

app.get('/', userService.ensureAuthenticated, (req, res) => {

    res.send(req.user);
});

// error handler

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err.stack); // eslint-disable-line no-console

    res.status(err.status || 404);
    res.send({
        message: err.message,
    });
});

// run magic

server.listen(process.env.PORT || 3000);


module.exports = app;
