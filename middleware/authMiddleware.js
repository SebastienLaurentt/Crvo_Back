const jwt = require('jsonwebtoken');

module.exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    req.user = { _id: decoded.userId, role: decoded.role }; // Ajout du rôle ici
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
