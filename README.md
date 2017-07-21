# Label Status Check

> "Don't merge that pull request if I'm not okay with it, right?"
>
> ... 2 hours later: "F*ck, you merged it anyway!"

## Install

Just add a new webhook to your Github repo, https://label-status-check.herokuapp.com/event_handler, then give it "Pull Request" and "Issues" events.

## How it works?

When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.
