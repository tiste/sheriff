'use strict';

import _ from 'lodash';
import { FEATURES } from './features';

const COMMIT_MSG_REGEX = /^((\w+)(?:\(([^\)\s]+)\))?: ([^A-Z].+))(?:\n|$)/;
const DEFAULT_BRANCH_REGEX = new RegExp(FEATURES.branch.options.pattern);

export function label(labels, name = FEATURES.label.options.name) {

    const isSuccess = !_(labels).filter((l) => {
        return l.toLowerCase() === name.toLowerCase();
    }).isEmpty();

    const description = isSuccess ? `The "${name}" label is attached, go for it` : `Pull Request doesn't have the label "${name}" yet`;

    return { isSuccess, description };
}

export function reviews(states, minimum = FEATURES.reviews.options.minimum) {

    const isSuccess = _(states).chain().filter((review) => {
        return review === 'APPROVED';
    }).size().value() >= minimum;

    const description = isSuccess ? `There is at least ${minimum} or more approvals, it's okay` : `Pull Request doesn't have enough reviews (${minimum})`;

    return { isSuccess, description };
}

export function commitMsg(commits) {

    const errors = _(commits).chain().filter((commit) => {
        return !COMMIT_MSG_REGEX.test(commit);
    }).size().value();

    const isSuccess = errors === 0;
    const description = isSuccess ? 'All commit messages are okay' : `Some commits (${errors}) have invalid messages`;

    return { isSuccess, description };
}

export function branch(branchName, pattern = DEFAULT_BRANCH_REGEX) {

    const isSuccess = pattern.test(branchName);
    const description = isSuccess ? 'The branch name is okay' : "The branch name doesn't match the pattern";

    return { isSuccess, description };
}
