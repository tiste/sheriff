'use strict';

import express from 'express';
import * as userService from '../users/userService';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Sheriff' });
});

router.get('/me', userService.ensureAuthenticated, (req, res) => {

    res.render('me', { title: 'Account - Sheriff', user: req.user });
});

router.post('/me', userService.ensureAuthenticated, (req, res, next) => {

    userService.update(req.body.slackUrl, req.user.token).then(() => {
        res.redirect('/');
    }).catch(next);
});

export default router;
