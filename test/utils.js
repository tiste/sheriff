'use strict';

import conf from '../config/config';
export const request = require('supertest')(conf.get('APP_URL')); // eslint-disable-line global-require
