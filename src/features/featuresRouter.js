'use strict';

import _ from 'lodash';
import express from 'express';
import querystring from 'querystring';
import conf from '../../config/config';
import * as userService from '../users/userService';
import FEATURES from './features';
import GithubService from '../github/githubService';
import GitlabService from '../gitlab/gitlabService';

const router = express.Router();

router.get(`/:feature(${_.keys(FEATURES).join('|')})`, userService.ensureAuthenticated, (req, res) => {
    const feature = FEATURES[req.params.feature];
    res.render('feature', { title: `Sheriff - ${feature.name}`, token: _.get(req.user, 'token', ''), feature, autocompleteUrl: req.user.provider });
});

router.post('/setup', userService.ensureAuthenticated, (req, res, next) => {

    const feature = FEATURES[req.body.name];
    const options = _.assign({ token: req.user.token }, req.body.options || {});
    const url = `${conf.get('APP_URL')}/${req.user.provider}/${feature.name}?${querystring.stringify(options)}`;

    if (req.user.provider === 'github') {
        const githubService = new GithubService().login(req.user.accessToken);
        const [owner, repo] = req.body.repo.split('/');

        githubService.createHook({ owner, repo }, feature.github_events, url).then(() => {
            res.redirect('/');
        }).catch(next);
    }
    else if (req.user.provider === 'gitlab') {
        const gitlabService = new GitlabService().login(req.user.accessToken);

        gitlabService.createHook(req.body.repo, url).then(() => {
            res.redirect('/');
        }).catch(next);
    }
});

export default router;
