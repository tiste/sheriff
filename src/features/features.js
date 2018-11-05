'use strict';

const FEATURES = {
    label: {
        name: 'label',
        description: 'Require pull request to be flagged with a dedicated label before merge.',
        options: {
            name: 'mergeable',
            branch: '',
        },
        github_events: ['pull_request'],
        img: 'label.png',
    },
    reviews: {
        name: 'reviews',
        description: 'Require pull request with required number of approving reviews and no changes requested.',
        options: {
            minimum: 2,
            branch: '',
        },
        github_events: ['pull_request', 'pull_request_review'],
        img: 'review.png',
    },
    'commit-msg': {
        name: 'commit-msg',
        description: 'Require pull request to have commit messages respecting the conventionalcommits.org.',
        options: {
            branch: '',
        },
        github_events: ['pull_request'],
        img: 'commit-msg.png',
    },
    branch: {
        name: 'branch',
        description: 'Require request branch name match with the given pattern.',
        options: {
            pattern: '*',
        },
        github_events: ['pull_request'],
        img: 'branch.png',
    },
    wip: {
        name: 'wip',
        description: 'Require pull request not to be in WIP mode (e.g. WIP: super duper PR).',
        options: {
            pattern: 'WIP: *',
        },
        github_events: ['pull_request'],
        img: 'wip.png',
    },
};

export default FEATURES;
