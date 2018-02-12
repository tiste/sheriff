'use strict';

import _ from 'lodash';
import GithubApi from 'github';
import * as sheriff from './sheriff';

const github = new GithubApi();

export default class Github {

    constructor(accessToken) {

        github.authenticate({
            type: 'oauth',
            token: accessToken,
        });
    }

    async processLabel({ owner, repo, sha }, number, label, compareBranches) {

        const { data: issue } = await github.issues.get({ owner, repo, number });

        const { isSuccess, description, bypass } = sheriff.label(_.map(issue.labels, 'name'), label, compareBranches);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/label', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processReviews({ owner, repo, sha }, number, minimum, compareBranches) {

        const { data: reviews } = await github.pullRequests.getReviews({ owner, repo, number });

        const { isSuccess, description, bypass } = sheriff.reviews(
            _(reviews)
                .chain()
                .sortBy('id')
                .reverse()
                .filter((review) => review.state !== 'COMMENTED')
                .uniqBy('user.id')
                .map('state').value(),
            minimum,
            compareBranches);

        const state = isSuccess ? 'success' : 'pending';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/reviews', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processCommitMsg({ owner, repo, sha }, number, compareBranches) {

        const { data: commits } = await github.pullRequests.getCommits({ owner, repo, number });

        const { isSuccess, description, bypass } = sheriff.commitMsg(_.map(commits, 'commit.message'), compareBranches);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/commit-msg', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processBranch({ owner, repo, sha }, branch, pattern) {

        const { isSuccess, description, bypass } = sheriff.branch(branch, pattern);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/branch', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    createHook({ owner, repo }, events, url) {

        return github.repos.createHook({ owner, repo, name: 'web', events, active: true, config: { url } });
    }
}
