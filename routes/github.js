'use strict';

import express from 'express';
import passport from 'passport';
import { FEATURES } from '../lib/features';
import { Github } from '../lib/github';

const router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

router.post('/label', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const label = req.query.name;

        const github = new Github(req.user.accessToken);
        return github.processLabel(pullRequest.base.user.login, pullRequest.base.repo.name, pullRequest.number, pullRequest.head.sha, label).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/reviews', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request', 'pull_request_review'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const minimum = req.query.minimum && parseInt(req.query.minimum, 10);

        const github = new Github(req.user.accessToken);
        return github.processReviews(pullRequest.base.user.login, pullRequest.base.repo.name, pullRequest.number, pullRequest.head.sha, minimum).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/commit-msg', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;

        const github = new Github(req.user.accessToken);
        return github.processCommitMsg(pullRequest.base.user.login, pullRequest.base.repo.name, pullRequest.number, pullRequest.head.sha).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/branch', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern && new RegExp(req.query.pattern);

        const github = new Github(req.user.accessToken);
        return github.processBranch(pullRequest.base.user.login, pullRequest.base.repo.name, pullRequest.head.sha, pullRequest.head.ref, pattern).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

export { router };
