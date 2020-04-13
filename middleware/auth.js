const config = require('config');
const jwt = require('jsonwebtoken');

const jwtSecret = config.get('jwt').secret;

//format of token:
//authorization:bearer <token>
function auth(req, res, next) {
  const bearerHeader = req.header('authorization');
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  if (!bearerToken) {
    const error = new Error('no token, authorization denied');
    error.status = 400;
    return next(error);
  }

  try {
    const decoded = jwt.verify(bearerToken, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return next(err);
  }
}

module.exports = auth;
