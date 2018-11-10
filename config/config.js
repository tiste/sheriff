'use strict';

import convict from 'convict';

const conf = convict({
    NODE_ENV: {
        doc: 'The application environment.',
        format: ['development', 'test', 'production', null],
        default: 'production',
        env: 'NODE_ENV',
    },
    APP_URL: {
        doc: 'The app url.',
        format: String,
        default: 'http://localhost:3000',
        env: 'APP_URL',
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
    GITLAB_APP_CLIENT_ID: {
        doc: 'The gitlab app client id.',
        format: String,
        default: 'ff5629621ddc37fbdfa3258630e77b2658a7ac68280bd1f16874084cf0b32cb7',
        env: 'GITLAB_APP_CLIENT_ID',
    },
    GITLAB_APP_SECRET_ID: {
        doc: 'The gitlab app secret id.',
        format: String,
        default: 'ede0ba986f8c9e1bb86df27b5f784fa159fa6daa8daf553b9e070bcd2356d9cc',
        env: 'GITLAB_APP_SECRET_ID',
    },
});

export default conf;
