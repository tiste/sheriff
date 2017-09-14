'use strict';

import GitHubApi from 'github';
import conf from '../config/config';

const github = new GitHubApi({ debug: true });

export class Github {

    login() {

        return github.authorization.create({
            client_id: conf.get('GITHUB_APP_CLIENT_ID'),
            scopes: ['repo,write:repo_hook'],
        });
    }
}
