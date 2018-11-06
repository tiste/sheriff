'use strict';

const FEATURES = {
    label: {
        name: 'label',
        description: 'Require pull request to be flagged with a dedicated label before merge.\n' +
            'For instance, when adding a "Mergeable" label to your pull request, sheriff will approve.',
        options: {
            name: {
                description: 'This variable is used to check if the specified label is present on the pull request (and it\'s unsensitive).',
                default: 'mergeable',
            },
            branch: {
                description: 'A pull request has a base branch, e.g. the branch on which you\'re about to merge. If the given value match the base branch, sheriff will be active.',
                default: '',
            },
        },
        github_events: ['pull_request'],
        img: 'label.png',
    },
    reviews: {
        name: 'reviews',
        description: 'Require pull request with required number of approving reviews and no changes requested.\n' +
            'For instance, when 2 or more approvals are given to your pull request, sheriff will approve. It will also check on requested reviewers.',
        options: {
            minimum: {
                description: 'You can configure the value to set the number of reviews you want for a pull request.',
                default: 2,
            },
            branch: {
                description: 'A pull request has a base branch, e.g. the branch on which you\'re about to merge. If the given value match the base branch, sheriff will be active.',
                default: '',
            },
        },
        github_events: ['pull_request', 'pull_request_review'],
        img: 'reviews.png',
    },
    'commit-msg': {
        name: 'commit-msg',
        description: 'Require pull request to have commit messages respecting the conventionalcommits.org.\n' +
            'For instance, when all commit messages of your pull request are respecting the conventionalcommits.org, sheriff will approve. You cannot configure convention for now.',
        options: {
            branch: {
                description: 'A pull request has a base branch, e.g. the branch on which you\'re about to merge. If the given value match the base branch, sheriff will be active.',
                default: '',
            },
        },
        github_events: ['pull_request'],
        img: 'commit-msg.png',
    },
    branch: {
        name: 'branch',
        description: 'Require request branch name match with the given pattern.\n' +
            'For instance, when your pull request branch name match with the *-JIRA-* pattern, sheriff will approve.',
        options: {
            pattern: {
                description: 'As a pull request start from a branch, you can configure the branch name format. This use minimatch, e.g. *-JIRA-* will accept "feature-JIRA-42".',
                default: '*',
            },
        },
        github_events: ['pull_request'],
        img: 'branch.png',
    },
    wip: {
        name: 'wip',
        description: 'Require pull request not to be in WIP mode (e.g. WIP: super duper PR).\n' +
            'For instance, when you pull request name is not in WIP mode (e.g. WIP: super duper PR), sheriff will approve.',
        options: {
            pattern: {
                description: 'This value will define a format of work in progress for your pull request title. You can change it as a minimatch pattern.',
                default: 'WIP: *',
            },
        },
        github_events: ['pull_request'],
        img: 'wip.png',
    },
};

export default FEATURES;
