'use strict';

import express from 'express';
import * as userService from '../lib/userService';

const router = express.Router();

router.get('/features', userService.ensureAuthenticated, (req, res) => {

    res.send('FEATURES');
});

export { router };
