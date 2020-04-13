const express = require('express');
const router = express.Router();
const config = require('config');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const User = require('../../models/User');

router.post(
  '/',
  [
    body('email', 'email is invalid').isEmail(),
    body(
      'password',
      `the password must at least be ${
        config.get('users').minPasswordLength
      } characters in length`
    ).isLength({ min: parseInt(config.get('users').minPasswordLength) }),
  ],
  (req, res, next) => {
    let validationErrors = validationResult(req);
    if (validationErrors.isLength != 0) {
      res.status(400).send(validationErrors);
    }
    const { username, email, password } = req.body;

    const newUser = new User({
      username,
      email,
      password,
    });

    User.findOne({ email }).then((user) => {
      if (user) {
        const error = new Error('user already exists');
        error.status = 400;
        return next(error);
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(password, salt, (err2, hash) => {
          if (err2) return next(err2);
          newUser.password = hash;
          //save new user and send jwt token to client
        });
      });
    });
  }
);

module.exports = router;
