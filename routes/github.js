'use strict';

import express from 'express';
import passport from 'passport';
import Slack from 'slack-node';
import Github from '../lib/github';

const router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

router.post('/label', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const action = JSON.parse(req.body.payload).action;
        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const label = req.query.name;
        const baseBranch = req.query.branch;

        const github = new Github().login(req.user.accessToken);
        return github.processLabel({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, label, [pullRequest.base.ref, baseBranch]).then((status) => {

            if (['opened', 'labeled'].includes(action) && req.user.slackUrl && status.isSuccess && !status.bypass) {
                const slack = new Slack();
                slack.setWebhook(req.user.slackUrl);

                slack.webhook({
                    text: `New PR as ${label} for branch <https://github.com/${pullRequest.base.user.login}/${pullRequest.base.repo.name}/pull/${pullRequest.number}|${pullRequest.head.ref}> available`,
                }, () => {});
            }

            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/reviews', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request', 'pull_request_review'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const minimum = req.query.minimum && parseInt(req.query.minimum, 10);
        const baseBranch = req.query.branch;

        const github = new Github().login(req.user.accessToken);
        return github.processReviews({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, minimum, [pullRequest.base.ref, baseBranch]).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/commit-msg', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const baseBranch = req.query.branch;

        const github = new Github().login(req.user.accessToken);
        return github.processCommitMsg({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, [pullRequest.base.ref, baseBranch]).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/branch', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern;

        const github = new Github().login(req.user.accessToken);
        return github.processBranch({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.head.ref, pattern).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/wip', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern;

        const github = new Github().login(req.user.accessToken);
        return github.processWip({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.title, pattern).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

export default router;
