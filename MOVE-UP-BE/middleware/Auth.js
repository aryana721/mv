const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secretkey', (err, user) => {
      if (err) return res.sendStatus(403);
      if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
};

module.exports = authMiddleware;