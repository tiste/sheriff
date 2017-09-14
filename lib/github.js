'use strict';

import _ from 'lodash';
import GitHubApi from 'github';

const COMMIT_MSG_REGEX = /^((\w+)(?:\(([^\)\s]+)\))?: ([^A-Z].+))(?:\n|$)/g;
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

        const isSuccess = !_(issue.labels).filter((l) => {
            return l.name.toLowerCase() === label.toLowerCase();
        }).isEmpty();

        const state = isSuccess ? 'success' : 'failure';
        const description = isSuccess ? `The "${label}" label is attached, go for it` : `Pull Request doesn't have the label "${label}" yet`;

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/label', description });
    }

    async processReviews(owner, repo, number, sha, minimum) {

        const { data: reviews } = await github.pullRequests.getReviews({ owner, repo, number });

        const isSuccess = _(reviews)
            .chain()
            .sortBy('id')
            .reverse()
            .uniqBy('user.id')
            .filter((review) => {
                return review.state === 'APPROVED';
            }).size().value() > minimum;

        const state = isSuccess ? 'success' : 'failure';
        const description = isSuccess ? `There is at least ${minimum} or more approvals, it's okay` : `Pull Request doesn't have enough reviews (${minimum})`;

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/reviews', description });
    }

    async processCommitMsg(owner, repo, number, sha) {

        const { data: commits } = await github.pullRequests.getCommits({ owner, repo, number });

        const errors = _(commits).chain().map('commit.message').filter((commit) => {
            return !COMMIT_MSG_REGEX.test(commit);
        }).size().value();

        const isSuccess = errors === 0;
        const state = isSuccess ? 'success' : 'failure';
        const description = isSuccess ? 'All commit messages are okay' : `Some commits (${errors}) have invalid messages`;

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/commit-msg', description });
    }

    async processBranch(owner, repo, sha, branch, pattern) {

        const isSuccess = pattern.test(branch);
        const state = isSuccess ? 'success' : 'failure';
        const description = isSuccess ? 'The branch name is okay' : "The branch name doesn't match the pattern";

        return github.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/branch', description });
    }
}
