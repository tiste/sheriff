'use strict';

import express from 'express';
import passport from 'passport';
import GitlabService from './gitlabService';

const router = express.Router();

router.get('/login', passport.authenticate('gitlab'));

router.get('/callback', passport.authenticate('gitlab', { failureRedirect: '/' }), (req, res) => {

    res.redirect('/?token=' + req.user.token);
});

router.post('/label', passport.authenticate('localapikey'), (req, res, next) => {

    if (['Merge Request Hook'].includes(req.get('x-gitlab-event'))) {

        const pullRequest = req.body;
        const label = req.query.name;
        const baseBranch = req.query.branch;

        const gitlabService = new GitlabService().login(req.user.accessToken);
        return gitlabService.processLabel(pullRequest.object_attributes.source_project_id, pullRequest.object_attributes.iid, label, baseBranch).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/commit-msg', passport.authenticate('localapikey'), (req, res, next) => {

    if (['Merge Request Hook'].includes(req.get('x-gitlab-event'))) {

        const pullRequest = req.body;
        const baseBranch = req.query.branch;

        const gitlabService = new GitlabService().login(req.user.accessToken);
        return gitlabService.processCommitMsg(pullRequest.object_attributes.source_project_id, pullRequest.object_attributes.iid, baseBranch).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

router.post('/branch', passport.authenticate('localapikey'), (req, res, next) => {

    if (['Merge Request Hook'].includes(req.get('x-gitlab-event'))) {

        const pullRequest = req.body;
        const pattern = req.query.pattern;

        const gitlabService = new GitlabService().login(req.user.accessToken);
        return gitlabService.processBranch(pullRequest.object_attributes.source_project_id, pullRequest.object_attributes.iid, pullRequest.object_attributes.source_branch, pattern).then((status) => {
            res.send(status);
        }).catch(next);
    }

    res.sendStatus(200);
});

export default router;
