'use strict';

import _ from 'lodash';
import GitlabApi from 'node-gitlab';
import minimatch from 'minimatch';
import * as sheriff from './sheriff';

export default class Gitlab {

    constructor(accessToken) {

        this.gitlab = GitlabApi.createPromise({
            accessToken,
            requestTimeout: 20000,
        });
    }

    async processLabel(projectId, mergeRequestId, label, baseBranch) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });

        const { isSuccess, description, bypass } = sheriff.label(mergeRequest.labels, label, [mergeRequest.target_branch, baseBranch]);
        const state = isSuccess ? 'success' : 'failed';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/label', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processCommitMsg(projectId, mergeRequestId, baseBranch) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });
        const commits = await this.gitlab.mergeRequests.listCommits({ id: projectId, merge_request_id: mergeRequestId });

        const { isSuccess, description, bypass } = sheriff.commitMsg(_.map(commits, 'title'), [mergeRequest.target_branch, baseBranch]);
        const state = isSuccess ? 'success' : 'failed';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/commit-msg', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processBranch(projectId, mergeRequestId, branch, pattern) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });

        const { isSuccess, description, bypass } = sheriff.branch(branch, pattern);
        const state = isSuccess ? 'success' : 'failed';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/branch', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    createHook(projectId, url) {

        return this.gitlab.hooks.create({ id: projectId, merge_requests_events: true, push_events: false, url });
    }
}
