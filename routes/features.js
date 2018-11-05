'use strict';

import _ from 'lodash';
import express from 'express';
import querystring from 'querystring';
import conf from '../config/config';
import * as userService from '../lib/userService';
import FEATURES from '../lib/features';
import GithubService from '../lib/githubService';
import Gitlab from '../lib/gitlab';

const router = express.Router();

router.get(`/:feature(${_.keys(FEATURES).join('|')})`, userService.ensureAuthenticated, (req, res) => {
    res.renderVue('App', { title: 'Sheriff', token: _.get(req.user, 'token', ''), feature: FEATURES[req.params.feature] }, { head: { title: 'Sheriff' } });
});

router.post('/setup', userService.ensureAuthenticated, (req, res, next) => {

    const feature = FEATURES[req.body.name];
    const options = _.assign({ token: req.user.token }, req.body.options || {});
    const url = `${conf.get('APP_URL')}/${req.user.provider}/${feature.name}?${querystring.stringify(options)}`;

    if (req.user.provider === 'github') {
        const github = new GithubService(req.user.accessToken);
        const [owner, repo] = req.body.repo.split('/');

        github.createHook({ owner, repo }, feature.github_events, url).then(() => {
            res.redirect('/');
        }).catch(next);
    }
    else if (req.user.provider === 'gitlab') {
        const gitlab = new Gitlab(req.user.accessToken);

        gitlab.createHook(encodeURIComponent(req.body.repo), url).then(() => {
            res.redirect('/');
        }).catch(next);
    }
});

export default router;
