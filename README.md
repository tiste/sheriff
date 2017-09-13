<p align="center">
  <img src="./public/images/logo.png" alt="Sheriff">
</p>

> "Don't merge that pull request because I'm not okay with it. You listen to me? Uh..."
>
> ... 2 hours later: "F*ck, you merged it anyway!"

## What is it?

<img src="./public/images/checks.png" alt="What is it?">

## Install

### Easy way

Just go on the website, choose for a [feature](#features), submit it!

### Manual way

Add a new webhook to your Github repo, then choose a [feature](#features), append your token and options to the URL.

Base URL: http://sheriff.tiste.io

Example: http://sheriff.tiste.io/reviews?minimum=3&token=foobar

## Features

### /label

When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.

> You can configure the label name with the query param `?name=AnotherLabel`

> Github events: "Pull Request"

### /reviews

When 2 or more approvals are given to your pull request, it will pass the status check to green, otherwise red.

> You can configure the minimum number of reviews with the query param `?minimum=1`

> Github events: "Pull Request", "Pull request review"

### /commit-msg

When all commit messages of your pull request are respecting the conventionalcommits.org, it will pass the status check to green, otherwise red.

> Github events: "Pull Request"

### /branch

When your pull request branch name match with the given pattern, it will pass the status check to green, otherwise red.

> You can configure the branch name pattern with the query param `?pattern=.*`

> Github events: "Pull Request"

## Run it locally

### Init project

Install ruby.

Install dependencies: `bundle install`

### Init db (with postgres)

`rake db:create && rake db:migrate`

### Run the server :rocket:

`npm start`

> You can choose to create your own OAuth app (via Github) and use your own credentials into `GITHUB_APP_CLIENT_ID` and `GITHUB_APP_SECRET_ID`
