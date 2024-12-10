const { createNewUser, getUserByEmail, getUserById, updateUserDetails, getUserByToken } = require('../services/userService');
const { logger } = require('../logger');
const statsdClient = require('../metrics');

const createUserController = async (req, res) => {
  logger.info('Received user creation request');
  const startTime = Date.now();
  statsdClient.increment('api.createUser.requests');

  try {
    if (Object.keys(req.query).length > 0 || req.url.includes('?')) {
      logger.warn(`User creation failed: Query parameters are not allowed in the URL for ${req.url}.`);
      return res.status(400).json({ message: 'Query parameters are not allowed in the URL.' });
    }
    if (req.headers.authorization) {
      logger.warn(`User creation failed: Authorization should not be provided for this request.`);
      return res.status(400).json({ message: 'Authorization should not be provided for this request.' });
    }

    const user = await createNewUser(req);
    const { id, first_name, last_name, email, account_created, account_updated } = user;
    logger.info(`New user created: ${first_name} ${last_name} (ID: ${id})`);

    statsdClient.increment('api.createUser.success');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.createUser.responseTime', elapsedTime);

    res.status(201).json({ first_name, last_name, email, account_created, account_updated });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    statsdClient.increment('api.createUser.failure');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.createUser.responseTime', elapsedTime);
    res.status(400).json({ message: error.message });
  }
};

const getUserController = async (req, res) => {
  logger.info('Received user retrieval request');
  const startTime = Date.now();
  statsdClient.increment('api.getUser.requests');

  try {
    if (Object.keys(req.query).length > 0 || req.url.includes('?')) {
      logger.warn(`User retrieval failed: Query parameters are not allowed in the URL for ${req.url}.`);
      return res.status(400).json({ message: 'Query parameters are not allowed in the URL.' });
    }
    if (Object.keys(req.body).length > 0) {
      logger.warn(`User retrieval failed: GET request should not contain a payload.`);
      return res.status(400).json({ message: 'GET request should not contain a payload' });
    }

    const user = await getUserById(req.user.id);
    logger.info(`User retrieved successfully: ${user.first_name} ${user.last_name} (ID: ${req.user.id})`);

    statsdClient.increment('api.getUser.success');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.getUser.responseTime', elapsedTime);

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error retrieving user: ${error.message}`);
    statsdClient.increment('api.getUser.failure');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.getUser.responseTime', elapsedTime);
    res.status(400).json({ message: error.message });
  }
};

const updateUserController = async (req, res) => {
  logger.info('Received user update request');
  const startTime = Date.now();
  statsdClient.increment('api.updateUser.requests');

  try {
    if (Object.keys(req.query).length > 0 || req.url.includes('?')) {
      logger.warn(`User update failed: Query parameters are not allowed in the URL for ${req.url}.`);
      return res.status(400).json({ message: 'Query parameters are not allowed in the URL.' });
    }

    await updateUserDetails(req.user.email, req);
    logger.info(`User data updated successfully for email: ${req.user.email}`);

    statsdClient.increment('api.updateUser.success');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.updateUser.responseTime', elapsedTime);

    res.status(204).json({ message: "User data updated" });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    statsdClient.increment('api.updateUser.failure');
    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.updateUser.responseTime', elapsedTime);
    res.status(400).json({ message: error.message });
  }
};

const verifyUserController = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(403).json({ message: 'Token not found' });
    }

    const user = await getUserByToken(token);
    if (!user) {
      return res.status(403).json({ message: 'Unauthenticated user' });
    }

    let tokenExpTime = new Date(user.emailSentTime).getTime() + (2 * 60 * 1000);
    let currentTime = new Date().getTime();
    if (currentTime > tokenExpTime) {
      return res.status(403).json({ message: 'Token expired' });
    }

    user.verified_user = true;
    await user.save();
    logger.info(`User ${user.id} verified successfully`);

    res.status(200).json({message: "User verified successfully"});
  } catch (error) {
    logger.error(`Error in verifying user: ${error.message}`);
    res.status(error.statusCode || 403).json({ message: error.message });
  }
}

module.exports = {
  createUserController,
  getUserController,
  updateUserController,
  verifyUserController,
};
