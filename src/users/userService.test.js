'use strict';

import * as pg from '../../lib/pg';
import * as userService from './userService';
import conf from '../../config/config';
import { FAKE_USER } from './userService';

jest.mock('hat', () => () => 42);
jest.mock('../../config/config');

describe('save()', () => {
    it('should get new user', async () => {
        pg.query = jest.fn().mockResolvedValue({});

        const user = await userService.save('123', 'github', 'accesstoken');

        expect(pg.query).toHaveBeenCalledWith('INSERT INTO users(access_token, provider, user_id, token) VALUES($1, $2, $3, $4)', ['accesstoken', 'github', '123', 42]);
        expect(user).toEqual({
            accessToken: 'accesstoken',
            provider: 'github',
            userId: '123',
            token: 42,
        });
    });
});

describe('updateToken()', () => {
    it('should updateToken an user', async () => {
        pg.query = jest.fn().mockResolvedValue({});

        const user = await userService.updateToken('123', 'github', 'accesstoken', 24);

        expect(pg.query).toHaveBeenCalledWith('UPDATE users SET access_token = $1 WHERE user_id = $2 AND provider = $3', ['accesstoken', '123', 'github']);
        expect(user).toEqual({
            accessToken: 'accesstoken',
            provider: 'github',
            userId: '123',
            token: 24,
        });
    });
});

describe('update()', () => {
    it('should update an user', async () => {
        pg.query = jest.fn().mockResolvedValue({
            rows: [{
                slack_url: 'http://',
            }],
        });

        const user = await userService.update('http://', 24);

        expect(pg.query).toHaveBeenCalledWith('UPDATE users SET slack_url = $1 WHERE token = $2 RETURNING *', ['http://', 24]);
        expect(user).toEqual({
            slackUrl: 'http://',
        });
    });
});

describe('login()', () => {
    it('should log an user', async () => {
        pg.query = jest.fn().mockResolvedValue({
            rows: [{
                access_token: 'accesstoken',
                provider: 'github',
                user_id: '123',
                token: 42,
                slack_url: 'http://',
            }],
        });

        const user = await userService.login(42);

        expect(pg.query).toHaveBeenCalledWith('SELECT * FROM users WHERE token = $1', [42]);
        expect(user).toEqual({
            accessToken: 'accesstoken',
            provider: 'github',
            userId: '123',
            token: 42,
            slackUrl: 'http://',
        });
    });

    it('should throw error when user not found', () => {
        expect.assertions(1);

        pg.query = jest.fn().mockResolvedValue({ rows: [] });

        return userService.login(42).catch((e) => {
            expect(e.message).toEqual('The user does not exist');
        });
    });
});

describe('ensureAuthenticated', () => {
    it('should pass if user is authenticated', () => {
        conf.get = jest.fn().mockReturnValue('production');
        const req = {
            isAuthenticated: jest.fn().mockReturnValue(true),
        };
        const next = jest.fn();

        userService.ensureAuthenticated(req, {}, next);

        expect(next).toHaveBeenCalled();
    });

    it('should redirect if user is not authenticated', () => {
        conf.get = jest.fn().mockReturnValue('production');
        const req = {
            isAuthenticated: jest.fn().mockReturnValue(false),
        };
        const res = {
            redirect: jest.fn(),
        };

        userService.ensureAuthenticated(req, res, {});

        expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('should set fake user if test mode', () => {
        conf.get = jest.fn().mockReturnValue('development');
        const req = {};
        const next = jest.fn();

        userService.ensureAuthenticated(req, {}, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(FAKE_USER);
    });
});
