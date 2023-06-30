const express = require('express');

const router = express.Router();

const Controller = require('../Controllers/index');

router.post('/register/create', Controller.register);

router.get(
    '/logout',
    Controller.authorization,
    Controller.destroySession
  );

router.post('/signIn', Controller.login);

router.put('/subscribe',Controller.authorization,Controller.subscribe);

router.get('/subscribe/list',Controller.authorization,Controller.subscribelist);

router.patch('/password/update',Controller.authorization,Controller.passupdate);

router.get('/get-all',Controller.getAllInfo);

module.exports = router;