'use strict';

import { Pool } from 'pg';
import * as pg from './pg';

jest.mock('pg');

describe('query', () => {
    it('query the pg lib', () => {
        pg.query('text', 'params');

        expect(Pool.prototype.query).toHaveBeenCalledWith('text', 'params');
    });
});
