'use strict';

import _ from 'lodash';
import { ProjectsBundle } from 'gitlab';
import * as sheriff from '../../lib/sheriff';

export default class GitlabService {

    constructor(gitlabInstance) {
        this.gitlab = gitlabInstance;
    }

    login(accessToken) {

        this.gitlab = new ProjectsBundle({
            oauthToken: accessToken,
        });
        return this;
    }

    async search(query) {

        return this.gitlab.Projects.Search(query).then((repos) => {
            return _.map(repos, 'path_with_namespace');
        });
    }

    async processLabel(projectId, mergeRequestId, label, baseBranch) {

        const mergeRequest = await this.gitlab.MergeRequests.show(projectId, mergeRequestId);

        const { isSuccess, description, bypass } = sheriff.label(mergeRequest.labels, label, [mergeRequest.target_branch, baseBranch]);
        const state = isSuccess ? 'success' : 'failed';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.gitlab.Commits.editStatus(projectId, mergeRequest.sha, { state, context: 'sheriff/label', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processCommitMsg(projectId, mergeRequestId, baseBranch) {

        const mergeRequest = await this.gitlab.MergeRequests.show(projectId, mergeRequestId);
        const commits = await this.gitlab.MergeRequests.commits(projectId, mergeRequestId);

        const { isSuccess, description, bypass } = sheriff.commitMsg(_.map(commits, 'title'), [mergeRequest.target_branch, baseBranch]);
        const state = isSuccess ? 'success' : 'failed';

        if (bypass) {
            return Promise.resolve({ isSuccess, description, bypass });
        }

        return this.gitlab.Commits.editStatus(projectId, mergeRequest.sha, { state, context: 'sheriff/commit-msg', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    async processBranch(projectId, mergeRequestId, branch, pattern) {

        const mergeRequest = await this.gitlab.MergeRequests.show(projectId, mergeRequestId);

        const { isSuccess, description, bypass } = sheriff.branch(branch, pattern);
        const state = isSuccess ? 'success' : 'failed';

        return this.gitlab.Commits.editStatus(projectId, mergeRequest.sha, { state, context: 'sheriff/branch', description })
            .then(() => {
                return { isSuccess, description, bypass };
            });
    }

    createHook(projectId, url) {

        return this.gitlab.ProjectHooks.add(projectId, url, { merge_requests_events: true, push_events: false });
    }
}
