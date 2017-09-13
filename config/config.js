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
});

module.exports = conf;
