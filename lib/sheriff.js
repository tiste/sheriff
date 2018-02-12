'use strict';

import _ from 'lodash';
import FEATURES from './features';
import minimatch from 'minimatch';

const COMMIT_MSG_REGEX = /^((\w+)(?:\(([^\)\s]+)\))?: ([^A-Z].+))(?:\n|$)/;

export function label(labels, name = FEATURES.label.options.name, compareBranches = []) {
    const [baseBranch, givenBaseBranch] = compareBranches;

    const isSuccess = !_(labels).filter((l) => {
        return l.toLowerCase() === name.toLowerCase();
    }).isEmpty();

    const description = isSuccess ? `The "${name}" label is attached, go for it` : `Pull Request doesn't have the label "${name}" yet`;

    if (givenBaseBranch && !minimatch(baseBranch, givenBaseBranch)) {
        return { isSuccess, description, bypass: true };
    }

    return { isSuccess, description, bypass: false };
}

export function reviews(states, minimum = FEATURES.reviews.options.minimum, compareBranches = []) {
    const [baseBranch, givenBaseBranch] = compareBranches;

    const approvals = _(states).chain().filter((review) => {
        return review === 'APPROVED';
    }).size().value();

    const requests = _(states).chain().filter((review) => {
        return review === 'CHANGES_REQUESTED';
    }).size().value();

    const isSuccess = approvals >= minimum && requests === 0;

    let description = `There is at least ${minimum} or more approvals, it's okay`;

    if (!isSuccess) {
        if (approvals >= minimum) {
            description = `There is at least ${minimum} or more approvals, but ${requests} changes requested`;
        }
        else {
            description = `Pull Request doesn't have enough reviews (${minimum})`;
        }
    }

    if (givenBaseBranch && !minimatch(baseBranch, givenBaseBranch)) {
        return { isSuccess, description, bypass: true };
    }

    return { isSuccess, description, bypass: false };
}

export function commitMsg(commits, compareBranches = []) {
    const [baseBranch, givenBaseBranch] = compareBranches;

    const errors = _(commits).chain().filter((commit) => {
        return !COMMIT_MSG_REGEX.test(commit);
    }).size().value();

    const isSuccess = errors === 0;
    const description = isSuccess ? 'All commit messages are okay' : `Some commits (${errors}) have invalid messages`;

    if (givenBaseBranch && !minimatch(baseBranch, givenBaseBranch)) {
        return { isSuccess, description, bypass: true };
    }

    return { isSuccess, description, bypass: false };
}

export function branch(branchName, pattern = FEATURES.branch.options.pattern) {

    const isSuccess = minimatch(branchName, pattern);
    const description = isSuccess ? 'The branch name is okay' : "The branch name doesn't match the pattern";

    return { isSuccess, description, bypass: false };
}
