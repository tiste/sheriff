'use strict';

import convict from 'convict';

const conf = convict({
    NODE_ENV: {
        doc: 'The applicaton environment.',
        format: ['development', 'test', 'production', null],
        default: 'development',
        env: 'NODE_ENV',
    },
    API_URL: {
        doc: 'The API url.',
        format: String,
        default: 'http://localhost:3000',
        env: 'API_URL',
    },
    DATABASE_URL: {
        doc: 'The database url.',
        format: String,
        default: 'postgresql://localhost:5432/sheriff',
        env: 'DATABASE_URL',
    },
    GITHUB_APP_CLIENT_ID: {
        doc: 'The github app client id.',
        format: String,
        default: 'b7fd2dec8e245b4b702b',
        env: 'GITHUB_APP_CLIENT_ID',
    },
    GITHUB_APP_SECRET_ID: {
        doc: 'The github app secret id.',
        format: String,
        default: '1b9a880e1b49ff1f077be64dfcabbdf0475f4ad0',
        env: 'GITHUB_APP_SECRET_ID',
    },
});

module.exports = conf;
