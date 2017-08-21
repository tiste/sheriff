FEATURES = {
  label: {
    name: 'label',
    description: 'When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.'\
      'You can configure the label name with the query param `?name=AnotherLabel`',
    options: {
      name: 'mergeable'
    },
    github_events: ['pull_request']
  },
  reviews: {
    name: 'reviews',
    description: 'When 2 or more approvals are given to your pull request, it will pass the status check to green, otherwise red.'\
      'You can configure the minimum number of reviews with the query param `?minimum=1`',
    options: {
      minimum: 2
    },
    github_events: ['pull_request', 'pull_request_review']
  },
  'commit-msg': {
    name: 'commit-msg',
    description: 'When all commit messages of your pull request are respecting the conventionalcommits.org, it will pass the status check to green, otherwise red.',
    options: {},
    github_events: ['pull_request']
  }
}
