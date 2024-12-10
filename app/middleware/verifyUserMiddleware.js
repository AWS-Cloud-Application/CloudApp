const User = require('../models/userModel');

const verifyUserMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.verified_user) {
      return res.status(403).json({ message: 'Account is not verified. Please verify your email to proceed.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyUserMiddleware };
