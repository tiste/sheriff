'use strict';

import _ from 'lodash';
import GitHubApi from 'github';
import * as sheriff from './sheriff';

const github = new GitHubApi();

export class Github {

    constructor(accessToken) {

        github.authenticate({
            type: 'oauth',
            token: accessToken,
        });
    }

    async processLabel(owner, repo, number, sha, label) {

        const { data: issue } = await github.issues.get({ owner, repo, number });

        const { isSuccess, description } = sheriff.label(_.map(issue.labels, 'name'), label);
        const state = isSuccess ? 'success' : 'failure';

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/label', description });
    }

    async processReviews(owner, repo, number, sha, minimum) {

        const { data: reviews } = await github.pullRequests.getReviews({ owner, repo, number });

        const { isSuccess, description } = sheriff.reviews(
            _(reviews)
                .chain()
                .sortBy('id')
                .reverse()
                .filter((review) => review.state !== 'COMMENTED')
                .uniqBy('user.id')
                .map('state').value(),
            minimum);

        const state = isSuccess ? 'success' : 'failure';

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/reviews', description });
    }

    async processCommitMsg(owner, repo, number, sha) {

        const { data: commits } = await github.pullRequests.getCommits({ owner, repo, number });

        const { isSuccess, description } = sheriff.commitMsg(_.map(commits, 'commit.message'));
        const state = isSuccess ? 'success' : 'failure';

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/commit-msg', description });
    }

    async processBranch(owner, repo, sha, branch, pattern) {

        const { isSuccess, description } = sheriff.branch(branch, pattern);
        const state = isSuccess ? 'success' : 'failure';

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/branch', description });
    }

    createHook(owner, repo, events, url) {

        return github.repos.createHook({ owner, repo, name: 'web', events, active: true, config: { url } });
    }
}
