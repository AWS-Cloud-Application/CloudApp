const imageService = require('../services/imageService');
const { logger } = require('../logger');
const statsdClient = require('../metrics');

//Add profile pic
const addProfilePic = async (req, res) => {
  const startTime = Date.now();
  statsdClient.increment('api.addProfilePic.requests');
  logger.info('Received request to add profile picture');

  if (req.fileValidationError) {
    logger.warn(`Profile picture upload failed: ${req.fileValidationError}`);
    statsdClient.increment('api.addProfilePic.failure');
    return res.status(400).json({ message: req.fileValidationError });
  }

  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      logger.warn(`Profile picture upload failed: No file provided for user ID ${userId}`);
      statsdClient.increment('api.addProfilePic.failure');
      return res.status(400).json({ message: 'Profile picture file is required ' });
    }

    const existingImageData = await imageService.getImage(userId);
    if (existingImageData) {
      logger.warn(`User ID ${userId} attempted to upload a new profile picture but already has one.`);
      statsdClient.increment('api.addProfilePic.failure');
      return res.status(400).json({ message: 'You already have a profile picture uploaded. Please delete it before uploading a new one.' });
    }

    const imageData = await imageService.uploadImage(file.buffer, file.originalname, userId);
    logger.info(`Profile picture uploaded successfully for user ID ${userId}`);
    statsdClient.increment('api.addProfilePic.success');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.addProfilePic.responseTime', elapsedTime);
    res.status(201).json(imageData);
  } catch (error) {
    logger.error(`Error uploading profile picture for user ID ${req.user.id}: ${error.message}`);
    statsdClient.increment('api.addProfilePic.failure');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.addProfilePic.responseTime', elapsedTime);

    if (error instanceof multer.MulterError || error.message.includes('Only jpg, jpeg, and png files are allowed.')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

//Get profile pic
const getProfilePic = async (req, res) => {
  const startTime = Date.now();
  statsdClient.increment('api.getProfilePic.requests');
  logger.info('Received request to get profile picture');

  if (Object.keys(req.body).length > 0) {
    logger.warn(`GET request for profile picture by user ID ${req.user.id} contained a body.`);
    statsdClient.increment('api.getProfilePic.failure');
    return res.status(400).json({ message: 'GET request should not contain a body.' });
  }

  try {
    const userId = req.user.id;
    const imageData = await imageService.getImage(userId);

    if (!imageData) {
      logger.warn(`Profile picture not found for user ID ${userId}`);
      statsdClient.increment('api.getProfilePic.failure');
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    logger.info(`Profile picture retrieved successfully for user ID ${userId}`);
    statsdClient.increment('api.getProfilePic.success');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.getProfilePic.responseTime', elapsedTime);
    res.status(200).json(imageData);
  } catch (error) {
    logger.error(`Error retrieving profile picture for user ID ${req.user.id}: ${error.message}`);
    statsdClient.increment('api.getProfilePic.failure');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.getProfilePic.responseTime', elapsedTime);

    res.status(500).json({ message: error.message });
  }
};


//Delete profile pic
const deleteProfilePic = async (req, res) => {
  const startTime = Date.now();
  statsdClient.increment('api.deleteProfilePic.requests');
  logger.info('Received request to delete profile picture');

  if (Object.keys(req.body).length > 0) {
    logger.warn(`DELETE request for profile picture by user ID ${req.user.id} contained a body.`);
    statsdClient.increment('api.deleteProfilePic.failure');
    return res.status(400).json({ message: 'DELETE request should not contain a body.' });
  }

  try {
    const userId = req.user.id;
    const imageData = await imageService.getImage(userId);

    if (!imageData) {
      logger.warn(`Profile picture not found for user ID ${userId}`);
      statsdClient.increment('api.deleteProfilePic.failure');
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    await imageService.deleteImage(userId);
    logger.info(`Profile picture deleted successfully for user ID ${userId}`);
    statsdClient.increment('api.deleteProfilePic.success');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.deleteProfilePic.responseTime', elapsedTime);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting profile picture for user ID ${req.user.id}: ${error.message}`);
    statsdClient.increment('api.deleteProfilePic.failure');

    const elapsedTime = Date.now() - startTime;
    statsdClient.timing('api.deleteProfilePic.responseTime', elapsedTime);

    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addProfilePic,
  getProfilePic,
  deleteProfilePic,
};
