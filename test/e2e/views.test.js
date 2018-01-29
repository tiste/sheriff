'use strict';

import { request } from '../utils';
import { expect } from '../config';
import cheerio from 'cheerio';

describe('-- Views tests --', () => {

    it('Display home view', () => {

        return request
            .get('/')
            .expect(200)
            .then((res) => {
                const $ = cheerio.load(res.res.text);
                expect($('title').text()).to.equal('Sheriff');
            });
    });
});
