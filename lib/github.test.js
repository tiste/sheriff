'use strict';

import Github from '../lib/github';
import octokit from '@octokit/rest';

jest.mock('@octokit/rest');
const githubMock = new octokit();

describe('processLabel', () => {
    it('should process label without bypassing', async () => {
        githubMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'mergeable' }],
                },
            }),
        };
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 'mergeable', ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label but bypass', async () => {
        githubMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'mergeable' }],
                },
            }),
        };
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 'mergeable', ['master', 'develop']);

        expect(githubMock.repos.createStatus).not.toHaveBeenCalled();
        expect(status).toEqual({
            bypass: true,
            description: 'The "mergeable" label is attached, go for it',
            isSuccess: true,
        });
    });

    it('should process label with failure', async () => {
        githubMock.issues = {
            get: jest.fn().mockResolvedValue({
                data: {
                    labels: [{ name: 'goforit' }],
                },
            }),
        };
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processLabel({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 'mergeable', ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: "Pull Request doesn't have the label \"mergeable\" yet",
            isSuccess: false,
        });
    });
});

describe('processReviews', () => {
    it('should process label', async () => {
        githubMock.pullRequests = {
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
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 1, ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: "There is at least 1 or more approvals, it's okay",
            isSuccess: true,
        });
    });

    it('should process label with failure', async () => {
        githubMock.pullRequests = {
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
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 1, ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'There is at least 1 or more approvals, but 1 changes requested',
            isSuccess: false,
        });
    });

    it('should process label with changes requested', async () => {
        githubMock.pullRequests = {
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
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processReviews({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, 1, ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Pull Request doesn\'t have enough reviews (1)',
            isSuccess: false,
        });
    });
});

describe('processCommitMsg', () => {
    it('should process commit messages', async () => {
        githubMock.pullRequests = {
            getCommits: jest.fn().mockResolvedValue({
                data: [
                    { commit: { message: 'feat: ok' } },
                    { commit: { message: 'fix: super' } },
                ],
            }),
        };
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processCommitMsg({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'All commit messages are okay',
            isSuccess: true,
        });
    });

    it('should process commit messages but 3 failures', async () => {
        githubMock.pullRequests = {
            getCommits: jest.fn().mockResolvedValue({
                data: [
                    { commit: { message: 'feat: Nok' } },
                    { commit: { message: 'feat:nok' } },
                    { commit: { message: 'hello' } },
                ],
            }),
        };
        githubMock.repos = { createStatus: jest.fn().mockResolvedValue() };
        const github = new Github(githubMock);

        const status = await github.processCommitMsg({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 2, ['master', 'master']);

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'Some commits (3) have invalid messages',
            isSuccess: false,
        });
    });
});

describe('processBranch', () => {
    it('should process commit messages', async () => {
        const github = new Github({
            repos: { createStatus: jest.fn().mockResolvedValue() },
        });

        const status = await github.processBranch({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'super-JIRA-01', '*-JIRA-*');

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name is okay',
            isSuccess: true,
        });
    });

    it('should process commit messages with failure', async () => {
        const github = new Github({
            repos: { createStatus: jest.fn().mockResolvedValue() },
        });

        const status = await github.processBranch({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'super-JIRA67', '*-JIRA-*');

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'The branch name doesn\'t match the pattern',
            isSuccess: false,
        });
    });
});

describe('processWip', () => {
    it('should process commit messages', async () => {
        const github = new Github({
            repos: { createStatus: jest.fn().mockResolvedValue() },
        });

        const status = await github.processWip({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'WIP: Super PR');

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'That pull request is still in work in progress',
            isSuccess: false,
        });
    });

    it('should process commit messages with failure', async () => {
        const github = new Github({
            repos: { createStatus: jest.fn().mockResolvedValue() },
        });

        const status = await github.processWip({
            owner: 'tiste',
            repo: 'sheriff',
            sha: '0101',
        }, 'Super PR');

        expect(githubMock.repos.createStatus).toHaveBeenCalled();
        expect(status).toEqual({
            bypass: false,
            description: 'That pull request is ready to go',
            isSuccess: true,
        });
    });
});
