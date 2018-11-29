<p align="center">
  <img src="./public/images/logo.png" alt="Sheriff">
  <br>
  <a href="https://slack.com/oauth/authorize?client_id=19989196163.310602755904&scope=incoming-webhook"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</p>

> "Don't merge that pull request because I'm not okay with it. You listen to me? Uh..."
>
> ... 2 hours later: "F*ck, you merged it anyway!"

[![Build Status](https://travis-ci.org/tiste/sheriff.svg?branch=master)](https://travis-ci.org/tiste/sheriff)
[![Coverage Status](https://coveralls.io/repos/github/tiste/sheriff/badge.svg?branch=master)](https://coveralls.io/github/tiste/sheriff?branch=master)

## What is it?

<img src="./public/images/checks.png" alt="What is it?">

## Features

### [sheriff.rocks/label](https://sheriff.rocks/label)

Require pull request to be flagged with a dedicated label before merge.  
For instance, when adding a "Mergeable" label to your pull request, sheriff will approve.

> You can configure the label name

### [sheriff.rocks/reviews](https://sheriff.rocks/reviews)

Require pull request with required number of approving reviews and no changes requested.  
For instance, when 2 or more approvals are given to your pull request, sheriff will approve. It will also check on requested reviewers.

> You can configure the value to set the number of reviews you want for a pull request

### [sheriff.rocks/commit-msg](https://sheriff.rocks/commit-msg)

Require pull request to have commit messages respecting the conventionalcommits.org.  
For instance, when all commit messages of your pull request are respecting the conventionalcommits.org, sheriff will approve.

> You cannot configure convention for now

### [sheriff.rocks/branch](https://sheriff.rocks/branch)

Require request branch name match with the given pattern.  
For instance, when your pull request branch name match with the \*-JIRA-* pattern, sheriff will approve.

> You can configure the branch name pattern

### [sheriff.rocks/wip](https://sheriff.rocks/wip)

Require pull request not to be in WIP mode (e.g. WIP: super duper PR).  
For instance, when you pull request name is not in WIP mode (e.g. WIP: super duper PR), sheriff will approve.

> You can configure the pattern, and the Slack channel

## CLI

```
$ sheriff --help

  Usage
    $ sheriff <feature> [--param=<value>]

  Example
    $ sheriff commitMsg --commits='feat: foobar'
    { isSuccesss: true, description: 'All commit messages are okay' }
```

> `npm link` will allow you to use it in dev mode

## Install

Just go on the website, choose for a [feature](#features), submit it!

You can also choose to publish success updates of the label Sheriff on your Slack channel.

<a href="https://slack.com/oauth/authorize?client_id=19989196163.310602755904&scope=incoming-webhook"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## Run it locally

### Init project

Install node.

Install dependencies: `npm i`

### Init db (with postgres)

`DATABASE_URL=postgresql://localhost:5432/postgres npm run migrate -- db:drop sheriff`
`DATABASE_URL=postgresql://localhost:5432/postgres npm run migrate -- db:create sheriff`
`DATABASE_URL=postgresql://localhost:5432/postgres npm run migrate -- up`

### Run the server :rocket:

Open ngrok on port 3000: `ngrok http 3000`

Launch the app: `DATABASE_URL=postgresql://localhost:5432/postgres APP_URL=http://XXX.ngrok.io GITHUB_APP_CLIENT_ID= GITHUB_APP_SECRET_ID= npm start`

> You can choose to create your own OAuth app (via Github/Gitlab) and use your own credentials into `GITHUB_APP_CLIENT_ID` or `GITLAB_APP_CLIENT_ID` and `GITHUB_APP_SECRET_ID` or `GITLAB_APP_SECRET_ID`

### Tests

`npm test -- -watch`

`npm run noreg`
