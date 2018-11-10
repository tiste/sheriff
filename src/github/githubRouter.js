'use strict';

import _ from 'lodash';
import express from 'express';
import passport from 'passport';
import Slack from 'slack-node';
import GithubService from './githubService';
import * as userService from '../users/userService';
import * as sheriff from '../../lib/sheriff';

const router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

router.get('/search', userService.ensureAuthenticated, (req, res, next) => {

    const githubService = new GithubService().login(req.user.accessToken);
    return githubService.search(req.query.q).then((names) => {
        res.send(names);
    }).catch(next);
});

router.post('/label', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const label = req.query.name;
        const baseBranch = req.query.branch;

        const githubService = new GithubService().login(req.user.accessToken);
        return githubService.processLabel({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, label, [pullRequest.base.ref, baseBranch]).then((status) => {

            const action = JSON.parse(req.body.payload).action;
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

        const githubService = new GithubService().login(req.user.accessToken);
        return githubService.processReviews({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, minimum, [pullRequest.base.ref, baseBranch]).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/commit-msg', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const baseBranch = req.query.branch;

        const githubService = new GithubService().login(req.user.accessToken);
        return githubService.processCommitMsg({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.number, [pullRequest.base.ref, baseBranch]).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/branch', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern;

        const githubService = new GithubService().login(req.user.accessToken);
        return githubService.processBranch({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.head.ref, pattern).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/wip', passport.authenticate('localapikey'), (req, res, next) => {

    if (['pull_request'].includes(req.get('x-github-event'))) {

        const pullRequest = JSON.parse(req.body.payload).pull_request;
        const pattern = req.query.pattern;

        const githubService = new GithubService().login(req.user.accessToken);
        return githubService.processWip({ owner: pullRequest.base.user.login, repo: pullRequest.base.repo.name, sha: pullRequest.head.sha }, pullRequest.title, pattern).then((status) => {
            const action = JSON.parse(req.body.payload).action;
            const oldName = _.get(JSON.parse(req.body.payload), 'changes.title.from');
            const oldNameIsWIP = !sheriff.wip(oldName, pattern).isSuccess;

            if (['opened', 'edited'].includes(action) && req.user.slackUrl && status.isSuccess && !status.bypass && oldNameIsWIP) {
                const slack = new Slack();
                slack.setWebhook(req.user.slackUrl);

                slack.webhook({
                    text: `New PR ready to go for branch <https://github.com/${pullRequest.base.user.login}/${pullRequest.base.repo.name}/pull/${pullRequest.number}|${pullRequest.head.ref}>`,
                }, () => {});
            }

            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

export default router;
