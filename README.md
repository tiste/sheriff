<p align="center">
  <img src="./public/images/logo.png" alt="Sheriff">
  <br>
  <a href="https://slack.com/oauth/authorize?client_id=19989196163.310602755904&scope=incoming-webhook"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</p>

> "Don't merge that pull request because I'm not okay with it. You listen to me? Uh..."
>
> ... 2 hours later: "F*ck, you merged it anyway!"

[![Build Status](https://travis-ci.org/tiste/sheriff.svg?branch=master)](https://travis-ci.org/tiste/sheriff)

## What is it?

<img src="./public/images/checks.png" alt="What is it?">

## Features

### /label

When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.

> You can configure the label name with the query param `?name=AnotherLabel`

> Github events: "Pull Request"

### /reviews

When 2 or more approvals are given to your pull request, it will pass the status check to green, otherwise red. It will also check on requested reviewers.

> You can configure the minimum number of reviews with the query param `?minimum=1`

> Github events: "Pull Request", "Pull request review"

### /commit-msg

When all commit messages of your pull request are respecting the conventionalcommits.org, it will pass the status check to green, otherwise red.

> Github events: "Pull Request"

### /branch

When your pull request branch name match with the given pattern, it will pass the status check to green, otherwise red.

> You can configure the branch name pattern with the query param `?pattern=*` as a [glob](https://github.com/isaacs/minimatch) syntax

> Github events: "Pull Request"

## CLI

```
$ sheriff --help

  Usage
    $ sheriff <feature> [--param=<value>]

  Example
    $ sheriff commitMsg --commits='feat: foobar'
    { isSuccesss: true, description: 'All commit messages are okay' }
```

## Install

### Easy way (SaaS)

Just go on the website, choose for a [feature](#features), submit it!

You can also choose to publish success updates of the label Sheriff on your Slack channel.

<a href="https://slack.com/oauth/authorize?client_id=19989196163.310602755904&scope=incoming-webhook"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

### Manual way

Add a new webhook to your Github repo, then choose a [feature](#features), append your token and options to the URL.

Base URL: https://sheriff.rocks

Providers: `['github', 'gitlab']`

Example: https://sheriff.rocks/github/reviews?minimum=3&token=foobar

## Run it locally

### Init project

Install node.

Install dependencies: `npm i`

### Init db (with postgres)

`DATABASE_URL=postgresql://localhost:5432/postgres db-migrate db:drop sheriff`
`DATABASE_URL=postgresql://localhost:5432/postgres db-migrate db:create sheriff`
`DATABASE_URL=postgresql://localhost:5432/sheriff db-migrate up`

### Run the server :rocket:

`npm start`

> You can choose to create your own OAuth app (via Github/Gitlab) and use your own credentials into `GITHUB_APP_CLIENT_ID` or `GITLAB_APP_CLIENT_ID` and `GITHUB_APP_SECRET_ID` or `GITLAB_APP_SECRET_ID`

### Tests

`npm test -- -watch`

`npm run noreg`
