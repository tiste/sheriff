'use strict';

import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

export { router };
