'use strict';

import express from 'express';
import conf from './config/config';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';

const app = express();
const server = require('http').Server(app);


// configure modules

console.log(`Current env: ${conf.get('NODE_ENV')}`); // eslint-disable-line no-console


// configure express middleware

app.set('view engine', 'pug');
app.set('trust proxy', true);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(express.static(path.join(__dirname, 'public')));


// routes

// app

app.get('/', async function (req, res) {
    await res.send('ok');
});

// error handler

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err.stack); // eslint-disable-line no-console

    res.status(err.status || 404);
    res.send({
        message: [err.message],
    });
});

// run magic

server.listen(process.env.PORT || 3000);


module.exports = app;
