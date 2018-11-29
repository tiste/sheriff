'use strict';

import GithubService from './githubService';
import octokit from '@octokit/rest';

jest.mock('@octokit/rest');
const octokitMock = new octokit();

describe('login', () => {
    it('should login', async () => {
        octokitMock.authenticate = jest.fn();
        const githubService = new GithubService(octokitMock);

        githubService.login('access_token');

        expect(octokitMock.authenticate).toHaveBeenCalledWith({
            type: 'oauth',
            token: 'access_token',
        });
    });
});

describe('search', () => {
    it('should search and get array of names', async () => {
        octokitMock.search = {
            repos: jest.fn().mockResolvedValue({
                data: {
                    items: [{ full_name: 'tiste/sheriff' }, { full_name: 'tiste/dotfiles' }],
                },
            }),
        };
        const githubService = new GithubService(octokitMock);

        const names = await githubService.search('tiste');

        expect(names).toEqual(['tiste/sheriff', 'tiste/dotfiles']);
    });
});

describe('processLabel', () => {
    it('should process label without bypassing', async () => {
        octokitMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'mergeable' }],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 'mergeable', ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label but bypass', async () => {
        octokitMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'mergeable' }],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 'mergeable', ['master', 'develop']);

        expect(octokitMock.repos.createStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label with failure', async () => {
        octokitMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'goforit' }],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 'mergeable', ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: "Pull Request doesn't have the label \"mergeable\" yet",
            isSuccess: false,
        });
    });
});

describe('processReviews', () => {
    it('should process reviews without bypassing', async () => {
        octokitMock.pullRequests = {
            getReviews: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, state: 'APPROVED', user: { id: 'tiste' } },
                    { id: 2, state: 'APPROVED', user: { id: 'no-tiste' } },
                    { id: 3, state: 'CHANGES_REQUESTED', user: { id: 'no-tiste' } },
                    { id: 4, state: 'APPROVED', user: { id: 'no-tiste' } },
                ],
            }),
            getReviewRequests: jest.fn().mockResolvedValue({
                data: {
                    users: [],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 1, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: "There is at least 1 or more approvals, it's okay",
            isSuccess: true,
        });
    });

    it('should process reviews but bypass', async () => {
        octokitMock.pullRequests = {
            getReviews: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, state: 'APPROVED', user: { id: 'tiste' } },
                    { id: 2, state: 'APPROVED', user: { id: 'no-tiste' } },
                    { id: 3, state: 'CHANGES_REQUESTED', user: { id: 'no-tiste' } },
                    { id: 4, state: 'APPROVED', user: { id: 'no-tiste' } },
                ],
            }),
            getReviewRequests: jest.fn().mockResolvedValue({
                data: {
                    users: [],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 1, ['master', 'develop']);

        expect(octokitMock.repos.createStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: "There is at least 1 or more approvals, it's okay",
            isSuccess: true,
        });
    });

    it('should process reviews with failure', async () => {
        octokitMock.pullRequests = {
            getReviews: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, state: 'APPROVED', user: { id: 'tiste' } },
                    { id: 2, state: 'APPROVED', user: { id: 'no-tiste' } },
                    { id: 3, state: 'CHANGES_REQUESTED', user: { id: 'no-tiste' } },
                ],
            }),
            getReviewRequests: jest.fn().mockResolvedValue({
                data: {
                    users: [],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 1, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'There is at least 1 or more approvals, but 1 changes requested',
            isSuccess: false,
        });
    });

    it('should process label with dismiss', async () => {
        octokitMock.pullRequests = {
            getReviews: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, state: 'CHANGES_REQUESTED', user: { id: 'tiste' } },
                    { id: 2, state: 'DISMISSED', user: { id: 'tiste' } },
                    { id: 3, state: 'APPROVED', user: { id: 'yes-tiste' } },
                ],
            }),
            getReviewRequests: jest.fn().mockResolvedValue({
                data: {
                    users: [],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 2, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'There is at least 2 or more approvals, it\'s okay',
            isSuccess: true,
        });
    });

    it('should process label with changes requested', async () => {
        octokitMock.pullRequests = {
            getReviews: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, state: 'CHANGES_REQUESTED', user: { id: 'tiste' } },
                    { id: 2, state: 'CHANGES_REQUESTED', user: { id: 'no-tiste' } },
                ],
            }),
            getReviewRequests: jest.fn().mockResolvedValue({
                data: {
                    users: [],
                },
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, 1, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Pull Request doesn\'t have enough reviews (1)',
            isSuccess: false,
        });
    });
});

describe('processCommitMsg', () => {
    it('should process commit messages without bypassing', async () => {
        octokitMock.pullRequests = {
            getCommits: jest.fn().mockResolvedValue({
                data: [
                    { commit: { message: 'feat: ok' } },
                    { commit: { message: 'fix: super' } },
                ],
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processCommitMsg({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'All commit messages are okay',
            isSuccess: true,
        });
    });

    it('should process commit messages but bypass', async () => {
        octokitMock.pullRequests = {
            getCommits: jest.fn().mockResolvedValue({
                data: [
                    { commit: { message: 'feat: ok' } },
                    { commit: { message: 'fix: super' } },
                ],
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processCommitMsg({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, ['master', 'develop']);

        expect(octokitMock.repos.createStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: 'All commit messages are okay',
            isSuccess: true,
        });
    });

    it('should process commit messages but 3 failures', async () => {
        octokitMock.pullRequests = {
            getCommits: jest.fn().mockResolvedValue({
                data: [
                    { commit: { message: 'feat: Nok' } },
                    { commit: { message: 'feat:nok' } },
                    { commit: { message: 'hello' } },
                ],
            }),
        };
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processCommitMsg({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 42, ['master', 'master']);

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Some commits (3) have invalid messages',
            isSuccess: false,
        });
    });
});

describe('processBranch', () => {
    it('should process commit messages', async () => {
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processBranch({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'super-JIRA-01', '*-JIRA-*');

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name is okay',
            isSuccess: true,
        });
    });

    it('should process commit messages with failure', async () => {
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processBranch({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'super-JIRA67', '*-JIRA-*');

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name doesn\'t match the pattern',
            isSuccess: false,
        });
    });
});

describe('processWip', () => {
    it('should process commit messages', async () => {
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processWip({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'WIP: Super PR');

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'That pull request is still in work in progress',
            isSuccess: false,
        });
    });

    it('should process commit messages with failure', async () => {
        octokitMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const githubService = new GithubService(octokitMock);

        const status = await githubService.processWip({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'Super PR');

        expect(octokitMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'That pull request is ready to go',
            isSuccess: true,
        });
    });
});

describe('createHook', () => {
    it('post hook', async () => {
        octokitMock.repos = {
            createHook: jest.fn(),
        };
        const githubService = new GithubService(octokitMock);

        githubService.createHook({ owner: 'tiste', repo: 'sheriff' }, ['pull_request'], 'http://');

        expect(octokitMock.repos.createHook).toHaveBeenCalledWith({
            owner: 'tiste',
            repo: 'sheriff',
            name: 'web',
            events: ['pull_request'],
            active: true,
            config: { url: 'http://', content_type: 'application/json' },
        });
    });
});
