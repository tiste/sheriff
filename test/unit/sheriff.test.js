'use strict';
/* eslint-disable no-unused-expressions */

import proxyquire from 'proxyquire';

describe('-- Sheriff tests --', () => {

    let sheriff;

    beforeEach(() => {

        sheriff = proxyquire('../../lib/sheriff', {});
    });

    describe('Label API', () => {

        it('Valid a label (capital label)', () => {

            const result = sheriff.label(['review done'], 'Review Done');
            result.should.be.eql({
                isSuccess: true,
                description: 'The "Review Done" label is attached, go for it',
                bypass: false,
            });
        });

        it('Valid a label (capital label) with given base branch', () => {

            const result = sheriff.label(['review done'], 'Review Done', ['release-1.0.0', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'The "Review Done" label is attached, go for it',
                bypass: false,
            });
        });

        it('Valid a label (capital labels)', () => {

            const result = sheriff.label(['Review Done'], 'review done');
            result.isSuccess.should.be.true;
        });

        it('Valid a label (default label)', () => {

            const result = sheriff.label(['Mergeable']);
            result.isSuccess.should.be.true;
        });

        it('Refuse a label with empty string labels', () => {

            const result = sheriff.label(['']);
            result.should.be.eql({
                isSuccess: false,
                description: 'Pull Request doesn\'t have the label "mergeable" yet',
                bypass: false,
            });
        });

        it('Refuse a label with empty labels', () => {

            const result = sheriff.label([]);
            result.isSuccess.should.be.false;
        });

        it('Does nothing when the given base branch is not the same as the PR', () => {

            const result = sheriff.label(['review done'], 'Review Done', ['release', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'The "Review Done" label is attached, go for it',
                bypass: true,
            });
        });
    });

    describe('Reviews API', () => {

        it('Valid reviews (default minimum value)', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED']);
            result.should.be.eql({
                isSuccess: true,
                description: 'There is at least 2 or more approvals, it\'s okay',
                bypass: false,
            });
        });

        it('Valid reviews (default minimum value) with given base branch', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, ['release-1.0.0', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'There is at least 2 or more approvals, it\'s okay',
                bypass: false,
            });
        });

        it('Valid reviews (specific number of reviews)', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED', 'APPROVED'], 3);
            result.should.be.eql({
                isSuccess: true,
                description: 'There is at least 3 or more approvals, it\'s okay',
                bypass: false,
            });
        });

        it('Refuse reviews with not enough reviews', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED'], 3);
            result.should.be.eql({
                isSuccess: false,
                description: 'Pull Request doesn\'t have enough reviews (3)',
                bypass: false,
            });
        });

        it('Refuse reviews with changes requested and enough reviews', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED', 'CHANGES_REQUESTED']);
            result.should.be.eql({
                isSuccess: false,
                description: 'There is at least 2 or more approvals, but 1 changes requested',
                bypass: false,
            });
        });

        it('Does nothing when the given base branch is not the same as the PR', () => {

            const result = sheriff.reviews(['APPROVED', 'APPROVED'], 2, ['release', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'There is at least 2 or more approvals, it\'s okay',
                bypass: true,
            });
        });
    });

    describe('Commit messages API', () => {

        it('Valid multiple angular commit messages', () => {

            const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops']);
            result.should.be.eql({
                isSuccess: true,
                description: 'All commit messages are okay',
                bypass: false,
            });
        });

        it('Valid multiple angular commit messages', () => {

            const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops'], ['release-1.0.0', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'All commit messages are okay',
                bypass: false,
            });
        });

        it('Valid one angular commit message', () => {

            const result = sheriff.commitMsg(['test: awesome test']);
            result.should.be.eql({
                isSuccess: true,
                description: 'All commit messages are okay',
                bypass: false,
            });
        });

        it('Valid 0 commit messages', () => {

            const result = sheriff.commitMsg([]);
            result.should.be.eql({
                isSuccess: true,
                description: 'All commit messages are okay',
                bypass: false,
            });
        });

        it('Refuse empty commit messages', () => {

            const result = sheriff.commitMsg(['']);
            result.should.be.eql({
                isSuccess: false,
                description: 'Some commits (1) have invalid messages',
                bypass: false,
            });
        });

        it('Refuse empty commit messages', () => {

            const result = sheriff.commitMsg(['Chore: Super', 'test: working', 'WIP']);
            result.should.be.eql({
                isSuccess: false,
                description: 'Some commits (2) have invalid messages',
                bypass: false,
            });
        });

        it('Does nothing when the given base branch is not the same as the PR', () => {

            const result = sheriff.commitMsg(['feat: awesome feature', 'chore: oops'], ['release', 'release-*']);
            result.should.be.eql({
                isSuccess: true,
                description: 'All commit messages are okay',
                bypass: true,
            });
        });
    });

    describe('Branch API', () => {

        it('Valid with default branch pattern', () => {

            const result = sheriff.branch('foo-branch');
            result.should.be.eql({
                isSuccess: true,
                description: 'The branch name is okay',
                bypass: false,
            });
        });

        it('Valid with specified branch pattern', () => {

            const result = sheriff.branch('foo-branch-JIRA-359', '*JIRA-[0-9]*');
            result.isSuccess.should.be.true;
        });

        it('Refuse with specified branch pattern', () => {

            const result = sheriff.branch('foo-branch-JIRA', '*JIRA-[0-9]*');
            result.should.be.eql({
                isSuccess: false,
                description: 'The branch name doesn\'t match the pattern',
                bypass: false,
            });
        });
    });
});
