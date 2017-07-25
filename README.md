<p align="center">
  <img src="http://ccofal.org/alabama/images/Alabama-Sheriffs.png" alt="Sheriff">
</p>

> "Don't merge that pull request because I'm not okay with it. You listen to me? Uh..."
>
> ... 2 hours later: "F*ck, you merged it anyway!"

## Install

Just add a new webhook to your Github repo, then give it "Pull Request", "Pull request review" and "Issues" events.

Base URL: http://sheriff.tiste.io

Example: http://sheriff.tiste.io/reviews?minimum=3

## How it works?

### /label

When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.

> You can configure the label name with the query param `?name=AnotherLabel`

### /reviews

When 2 or more approvals are given to your pull request, it will pass the status check to green, otherwise red.

> You can configure the minimum number of reviews with the query param `?minimum=1`
