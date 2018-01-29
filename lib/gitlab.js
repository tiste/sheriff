'use strict';

import _ from 'lodash';
import GitlabApi from 'node-gitlab';
import * as sheriff from './sheriff';

export class Gitlab {

    constructor(accessToken) {

        this.gitlab = GitlabApi.createPromise({
            accessToken,
            requestTimeout: 20000,
        });
    }

    async processLabel(projectId, mergeRequestId, label, baseBranch) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });

        if (baseBranch && mergeRequest.target_branch !== baseBranch) {
            return Promise.resolve(204);
        }

        const { isSuccess, description } = sheriff.label(mergeRequest.labels, label);
        const state = isSuccess ? 'success' : 'failed';

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/label', description });
    }

    async processCommitMsg(projectId, mergeRequestId) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });
        const commits = await this.gitlab.mergeRequests.listCommits({ id: projectId, merge_request_id: mergeRequestId });

        const { isSuccess, description } = sheriff.commitMsg(_.map(commits, 'title'));
        const state = isSuccess ? 'success' : 'failed';

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/commit-msg', description });
    }

    async processBranch(projectId, mergeRequestId, branch, pattern) {

        const mergeRequest = await this.gitlab.mergeRequests.get({ id: projectId, merge_request_id: mergeRequestId });

        const { isSuccess, description } = sheriff.branch(branch, pattern);
        const state = isSuccess ? 'success' : 'failed';

        return this.gitlab.projects.createStatus({ id: projectId, sha: mergeRequest.sha, state, context: 'sheriff/branch', description });
    }

    createHook(projectId, url) {

        return this.gitlab.hooks.create({ id: projectId, merge_requests_events: true, push_events: false, url });
    }
}
