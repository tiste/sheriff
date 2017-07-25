# Sheriff

> "Don't merge that pull request because I'm not okay with it. You listen to me? Uh..."
>
> ... 2 hours later: "F*ck, you merged it anyway!"

## Install

Just add a new webhook to your Github repo, then give it "Pull Request" and "Issues" events.

Base URL: http://sheriff.tiste.io

## How it works?

### /label

When adding a "Mergeable" label to your pull request, it will pass the status check to green, otherwise red.

> You can configure the label name with the query param `?name=AnotherLabel`
