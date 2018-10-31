'use strict';

import * as sheriff from './sheriff';

describe('Label API', () => {

    it('valid a label (capital label)', () => {
        const result = sheriff.label(['review done'], 'Review Done');
        expect(result).toEqual({
            isSuccess: true,
            description: 'The "Review Done" label is attached, go for it',
            bypass: false,
        });
    });

    it('valid a label (capital label) with given base branch', () => {
        const result = sheriff.label(['review done'], 'Review Done', ['release-1.0.0', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'The "Review Done" label is attached, go for it',
            bypass: false,
        });
    });

    it('valid a label (capital labels)', () => {
        const result = sheriff.label(['Review Done'], 'review done');
        expect(result.isSuccess).toBe(true);
    });

    it('valid a label (default label)', () => {
        const result = sheriff.label(['Mergeable']);
        expect(result.isSuccess).toBe(true);
    });

    it('refuse a label with empty string labels', () => {
        const result = sheriff.label(['']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'Pull Request doesn\'t have the label "mergeable" yet',
            bypass: false,
        });
    });

    it('refuse a label with empty labels', () => {
        const result = sheriff.label([]);
        expect(result.isSuccess).toBe(false);
    });

    it('does nothing when the given base branch is not the same as the PR', () => {
        const result = sheriff.label(['review done'], 'Review Done', ['release', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'The "Review Done" label is attached, go for it',
            bypass: true,
        });
    });
});

describe('Reviews API', () => {

    it('valid reviews (default minimum value)', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'There is at least 2 or more approvals, it\'s okay',
            bypass: false,
        });
    });

    it('valid reviews (default minimum value) with given base branch', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, [], ['release-1.0.0', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'There is at least 2 or more approvals, it\'s okay',
            bypass: false,
        });
    });

    it('valid reviews (specific number of reviews)', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED', 'APPROVED'], 3);
        expect(result).toEqual({
            isSuccess: true,
            description: 'There is at least 3 or more approvals, it\'s okay',
            bypass: false,
        });
    });

    it('refuse reviews with not enough reviews', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED'], 3);
        expect(result).toEqual({
            isSuccess: false,
            description: 'Pull Request doesn\'t have enough reviews (3)',
            bypass: false,
        });
    });

    it('valid reviews with one required reviewer', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, ['tiste']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'tiste must review that pull request',
            bypass: false,
        });
    });

    it('valid reviews with multiple required reviewer', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, ['tiste', 'chuck']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'tiste and chuck must review that pull request',
            bypass: false,
        });
    });

    it('refuse reviews with changes requested and enough reviews', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED', 'CHANGES_REQUESTED']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'There is at least 2 or more approvals, but 1 changes requested',
            bypass: false,
        });
    });

    it('does nothing when the given base branch is not the same as the PR', () => {
        const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, [], ['release', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'There is at least 2 or more approvals, it\'s okay',
            bypass: true,
        });
    });
});

describe('Commit messages API', () => {

    it('valid multiple angular commit messages', () => {
        const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'All commit messages are okay',
            bypass: false,
        });
    });

    it('valid multiple angular commit messages', () => {
        const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops'], ['release-1.0.0', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'All commit messages are okay',
            bypass: false,
        });
    });

    it('valid one angular commit message', () => {
        const result = sheriff.commitMsg(['test: awesome test']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'All commit messages are okay',
            bypass: false,
        });
    });

    it('valid 0 commit messages', () => {
        const result = sheriff.commitMsg([]);
        expect(result).toEqual({
            isSuccess: true,
            description: 'All commit messages are okay',
            bypass: false,
        });
    });

    it('refuse empty commit messages', () => {
        const result = sheriff.commitMsg(['']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'Some commits (1) have invalid messages',
            bypass: false,
        });
    });

    it('refuse empty commit messages', () => {
        const result = sheriff.commitMsg(['Chore: Super', 'test: working', 'WIP']);
        expect(result).toEqual({
            isSuccess: false,
            description: 'Some commits (2) have invalid messages',
            bypass: false,
        });
    });

    it('does nothing when the given base branch is not the same as the PR', () => {
        const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops'], ['release', 'release-*']);
        expect(result).toEqual({
            isSuccess: true,
            description: 'All commit messages are okay',
            bypass: true,
        });
    });
});

describe('Branch API', () => {

    it('valid with default branch pattern', () => {
        const result = sheriff.branch('foo-branch');
        expect(result).toEqual({
            isSuccess: true,
            description: 'The branch name is okay',
            bypass: false,
        });
    });

    it('valid with specified branch pattern', () => {
        const result = sheriff.branch('foo-branch-JIRA-359', '*JIRA-[0-9]*');
        expect(result.isSuccess).toBe(true);
    });

    it('refuse with specified branch pattern', () => {
        const result = sheriff.branch('foo-branch-JIRA', '*JIRA-[0-9]*');
        expect(result).toEqual({
            isSuccess: false,
            description: 'The branch name doesn\'t match the pattern',
            bypass: false,
        });
    });
});
