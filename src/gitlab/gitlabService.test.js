'use strict';

import GitlabService from './gitlabService';
import GitlabApi from 'gitlab';

jest.mock('gitlab');
const gitlabMock = new GitlabApi();

describe('search', () => {
    it('should search and get array of names', async () => {
        gitlabMock.Search = {
            all: jest.fn().mockResolvedValue([
                { path_with_namespace: 'tiste/sheriff' },
                { path_with_namespace: 'tiste/dotfiles' },
            ]),
        };
        const gitlabService = new GitlabService(gitlabMock);

        const names = await gitlabService.search('tiste');

        expect(names).toEqual(['tiste/sheriff', 'tiste/dotfiles']);
    });
});

describe('processLabel', () => {
    it('should process label without bypassing', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                labels: ['mergeable'],
                target_branch: 'master',
            }),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processLabel('tiste/sheriff', 3, 'mergeable', 'master');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label but bypass', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                labels: ['mergeable'],
                target_branch: 'develop',
            }),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processLabel('tiste/sheriff', 3, 'mergeable', 'master');

        expect(gitlabMock.Commits.editStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label with failure', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                labels: ['goforit'],
                target_branch: 'master',
            }),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processLabel('tiste/sheriff', 3, 'mergeable', 'master');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Pull Request doesn\'t have the label \"mergeable\" yet',
            isSuccess: false,
        });
    });
});

describe('processCommitMsg', () => {
    it('should process label without bypassing', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                target_branch: 'master',
            }),
            commits: jest.fn().mockResolvedValue([
                { title: 'feat: ok' },
                { title: 'fix: super' },
            ]),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processCommitMsg('tiste/sheriff', 3, 'master');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'All commit messages are okay',
            isSuccess: true,
        });
    });

    it('should process label but bypass', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                target_branch: 'develop',
            }),
            commits: jest.fn().mockResolvedValue([
                { title: 'feat: ok' },
                { title: 'fix: super' },
            ]),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processCommitMsg('tiste/sheriff', 3, 'master');

        expect(gitlabMock.Commits.editStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: 'All commit messages are okay',
            isSuccess: true,
        });
    });

    it('should process label with 3 failures', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({
                target_branch: 'master',
            }),
            commits: jest.fn().mockResolvedValue([
                { title: 'feat: Nok' },
                { title: 'feat:nok' },
                { title: 'hello' },
            ]),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processCommitMsg('tiste/sheriff', 3, 'master');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Some commits (3) have invalid messages',
            isSuccess: false,
        });
    });
});

describe('processBranch', () => {
    it('should process branch', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({}),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processBranch('tiste/sheriff', 3, 'super-JIRA-01', '*-JIRA-*');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name is okay',
            isSuccess: true,
        });
    });

    it('should process branch with failure', async () => {
        gitlabMock.MergeRequests = {
            show: jest.fn().mockResolvedValue({}),
        };
        gitlabMock.Commits = { editStatus: jest.fn().mockResolvedValue() };
        const githubService = new GitlabService(gitlabMock);

        const status = await githubService.processBranch('tiste/sheriff', 3, 'super-JIRA67', '*-JIRA-*');

        expect(gitlabMock.Commits.editStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name doesn\'t match the pattern',
            isSuccess: false,
        });
    });
});

describe('createHook', () => {
    it('post hook', async () => {
        gitlabMock.ProjectHooks = {
            add: jest.fn(),
        };
        const gitlabService = new GitlabService(gitlabMock);

        gitlabService.createHook('tiste/sheriff', 'http://');

        expect(gitlabMock.ProjectHooks.add).toHaveBeenCalledWith('tiste/sheriff', 'http://', { merge_requests_events: true, push_events: false });
    });
});
