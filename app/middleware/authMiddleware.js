const bcrypt = require('bcrypt');
const { getUserByEmail } = require('../services/userService');

const basicAuthorization = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const data = authHeader.split(' ')[1];
  const credentials = Buffer.from(data, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const user = await getUserByEmail(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.user = user;
  next();
};

module.exports = basicAuthorization;
