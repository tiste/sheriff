'use strict';

import { Pool } from 'pg';
import conf from '../config/config';

const pool = new Pool({
    connectionString: conf.get('DATABASE_URL'),
});

export function query(text, params) {
    return pool.query(text, params);
}
