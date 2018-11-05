'use strict';

import _ from 'lodash';
import octokit from '@octokit/rest';
import * as sheriff from './sheriff';


export default class GithubService {

    constructor(github = new octokit()) {

        this.octokit = github;
    }

    login(accessToken) {

        this.octokit.authenticate({
            type: 'oauth',
            token: accessToken,
        });
        return this;
    }

    async processLabel({ owner, repo, sha }, number, label, compareBranches) {

        const { data: issue } = await this.octokit.issues.get({ owner, repo, number });

        const { isSuccess, description, bypass } = sheriff.label(_.map(issue.labels, 'name'), label, compareBranches);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.octokit.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/label', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processReviews({ owner, repo, sha }, number, minimum, compareBranches) {

        const { data: reviews } = await this.octokit.pullRequests.getReviews({ owner, repo, number, per_page: 1000 });
        const { data: requestedReviewers } = await this.octokit.pullRequests.getReviewRequests({ owner, repo, number });

        const reviewers = _(reviews)
            .chain()
            .filter((review) => !['COMMENTED'].includes(review.state))
            .sortBy('id')
            .reverse()
            .map((review) => {
                if (['DISMISSED'].includes(review.state)) {
                    review.state = 'APPROVED';
                }

                return review;
            })
            .uniqBy('user.id')
            .value();

        const { isSuccess, description, bypass } = sheriff.reviews(
            _.map(reviewers, 'state'),
            minimum,
            _.difference(_.map(requestedReviewers.users, 'login'), _.keys(reviewers)),
            compareBranches);

        const state = isSuccess ? 'success' : 'pending';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.octokit.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/reviews', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processCommitMsg({ owner, repo, sha }, number, compareBranches) {

        const { data: commits } = await this.octokit.pullRequests.getCommits({ owner, repo, number });

        const { isSuccess, description, bypass } = sheriff.commitMsg(_.map(commits, 'commit.message'), compareBranches);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.octokit.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/commit-msg', description })
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

        return this.octokit.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/branch', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processWip({ owner, repo, sha }, title, pattern) {

        const { isSuccess, description, bypass } = sheriff.wip(title, pattern);
        const state = isSuccess ? 'success' : 'failure';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.octokit.repos.createStatus({ owner, repo, sha, state, context: 'sheriff/wip', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    createHook({ owner, repo }, events, url) {

        return this.octokit.repos.createHook({ owner, repo, name: 'web', events, active: true, config: { url } });
    }
}
