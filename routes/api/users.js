const express = require('express');
const router = express.Router();
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../../models/User');
const jwtSecret = config.get('jwt').secret;
const minPasswordLength = config.get('users').minPasswordLength;
const minUsernameLength = config.get('users').minUsernameLength;

// @route post api/users
// @desc user registration, sends jwt to client
// @access Public
router.post(
  '/',
  [
    body('username')
      .trim()
      .isAlphanumeric()
      .isLength({ min: parseInt(minUsernameLength) }),
    body('email').isEmail().normalizeEmail(),
    body('password')
      .trim()
      .isAlphanumeric()
      .isLength({ min: parseInt(minPasswordLength) }),
  ],
  (req, res, next) => {
    let result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result);
    }
    const { username, email, password } = req.body;

    User.findOne({ email }).then((user) => {
      if (user) {
        const error = new Error('user already exists');
        error.status = 400;
        return next(error);
      }

      const newUser = new User({
        username,
        email,
        password,
      });

      bcrypt.genSalt(10, (saltErr, salt) => {
        if (saltErr) return next(saltErr);
        bcrypt.hash(password, salt, (hashErr, hash) => {
          if (hashErr) return next(hashErr);

          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              jwt.sign(
                {
                  id: user.id,
                },
                jwtSecret,
                { expiresIn: parseInt(config.get('jwt').expires) },
                (err, token) => {
                  if (err) return next(err);
                  return res.status(200).json({
                    token,
                    user: {
                      id: user.id,
                      name: user.username,
                      email: user.email,
                    },
                  });
                }
              );
            })
            .catch((err) => {
              return next(err);
            });
        });
      });
    });
  }
);

module.exports = router;
