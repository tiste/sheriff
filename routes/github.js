'use strict';

import express from 'express';
import passport from 'passport';
import minimatch from 'minimatch';
import Github from '../lib/github';

const router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

router.post('/label', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const label = req.query.name;
        const baseBranch = req.query.branch;

        if (baseBranch && !minimatch(pullRequest.base.ref, baseBranch)) {
            return res.sendStatus(204);
        }

        const github = new Github(req.user.accessToken);
        return github.processLabel({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, label).then(() => {
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
        return github.processReviews({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, minimum).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/commit-msg', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;

        const github = new Github(req.user.accessToken);
        return github.processCommitMsg({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/branch', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern;

        const github = new Github(req.user.accessToken);
        return github.processBranch({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.head.ref, pattern).then(() => {
            res.sendStatus(200);
        }).catch(next);
    }

    res.sendStatus(200);
});

export default router;
