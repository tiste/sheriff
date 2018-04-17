'use strict';

const FEATURES = {
    label: {
        name: 'label',
        description: `When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.
You can configure the label name with the query param \`?name=AnotherLabel\`. You can also specify a target branch on which you want the sheriff to check on.`,
        options: {
            name: 'mergeable',
            branch: '',
        },
        github_events: ['pull_request'],
    },
    reviews: {
        name: 'reviews',
        description: `When 2 or more approvals are given to your pull request, it will pass the status check to green, otherwise red. It will also check on requested reviewers.
You can configure the minimum number of reviews with the query param \`?minimum=1\`. You can also specify a target branch on which you want the sheriff to check on.`,
        options: {
            minimum: 2,
            branch: '',
        },
        github_events: ['pull_request', 'pull_request_review'],
    },
    'commit-msg': {
        name: 'commit-msg',
        description: 'When all commit messages of your pull request are respecting the conventionalcommits.org, it will pass the status check to green, otherwise red. You can also specify a target branch on which you want the sheriff to check on.',
        options: {
            branch: '',
        },
        github_events: ['pull_request'],
    },
    branch: {
        name: 'branch',
        description: `When your pull request branch name match with the given pattern, it will pass the status check to green, otherwise red.
You can configure the branch name pattern with the query param \`?pattern=*\` as a [glob](https://github.com/isaacs/minimatch) syntax`,
        options: {
            pattern: '*',
        },
        github_events: ['pull_request'],
    },
};

export default FEATURES;
