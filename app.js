'use strict';

import 'newrelic';

import _ from 'lodash';
import express from 'express';
import conf from './config/config';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalAPIKeyStrategy } from 'passport-localapikey';
import { Strategy as GithubStrategy } from 'passport-github';
import { Strategy as GitlabStrategy } from 'passport-gitlab2';
import expressVue from 'express-vue';
import { query } from './lib/pg';
import * as userService from './lib/userService';

import featuresRouter from './routes/features';
import githubRouter from './routes/github';
import gitlabRouter from './routes/gitlab';

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

passport.use(new GithubStrategy({
    clientID: conf.get('GITHUB_APP_CLIENT_ID'),
    clientSecret: conf.get('GITHUB_APP_SECRET_ID'),
    scope: ['repo', 'write:repo_hook'],
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

passport.use(new GitlabStrategy({
    clientID: conf.get('GITLAB_APP_CLIENT_ID'),
    clientSecret: conf.get('GITLAB_APP_SECRET_ID'),
    callbackURL: `${conf.get('APP_URL')}/gitlab/callback`,
    scope: ['api'],
}, (accessToken, refreshToken, profile, done) => {

    query('SELECT * FROM users WHERE user_id = $1 AND provider = $2', [profile.id, 'gitlab']).then(({ rows }) => {
        if (!rows[0]) {
            return userService.save(profile.id, 'gitlab', accessToken).then((user) => {

                return done(null, user);
            }).catch((e) => done(e, false));
        }

        userService.update(profile.id, 'gitlab', accessToken, rows[0].token).then((user) => {

            return done(null, user);
        }).catch((e) => done(e, false));
    }).catch((e) => done(e, false));
}));


// configure express middleware

app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(expressVue.init({
    rootPath: path.join(__dirname, 'views'),
    vue: {
        head: {
            meta: [
                {
                    script: 'https://unpkg.com/vue/dist/vue.js',
                },
                {
                    script: 'https://unpkg.com/vuetify/dist/vuetify.js',
                },
                {
                    script: 'https://unpkg.com/axios/dist/axios.min.js',
                },
                {
                    style: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
                },
                {
                    style: 'https://unpkg.com/vuetify/dist/vuetify.min.css',
                },
            ],
        },
    },
}));

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
}));
app.use(passport.initialize());
app.use(passport.session());


// routes

// app

app.get('/', (req, res) => {

    res.renderVue('HomePage', { title: 'Sheriff', token: _.get(req.user, 'token', '') }, { head: { title: 'Sheriff' } });
});

app.get('/me', userService.ensureAuthenticated, (req, res) => {

    res.send(req.user);
});

app.use('/', featuresRouter);
app.use('/github', githubRouter);
app.use('/gitlab', gitlabRouter);

// error handler

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err.stack); // eslint-disable-line no-console

    if (isNaN(err.status)) {
        err.status = 500;
    }

    res.status(err.status || 404);
    res.send({
        message: err.message,
    });
});

// run magic

server.listen(process.env.PORT || 3000);


module.exports = app;
