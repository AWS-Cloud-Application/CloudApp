const statsdClient = require('../metrics');
const { healthCheck } = require('../services/healthService');
const { logger } = require('../logger');

const healthCheckStatus = async (req, res) => {
    logger.info('Received health check request');
    const startTime = Date.now();
    statsdClient.increment('api.healthCheckStatus.requests');
    res.setHeader('Cache-Control', 'no-cache');

    const isDatabaseConnected = await healthCheck();
    
    if (isDatabaseConnected) {
        logger.info('Database connection is healthy');
        statsdClient.increment('api.healthCheckStatus.success');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        const elapsedTime = Date.now() - startTime;
        statsdClient.timing('api.healthCheckStatus.responseTime', elapsedTime);
        return res.status(200).send();
    } else {
        logger.warn('Database connection is not healthy');
        statsdClient.increment('api.healthCheckStatus.failure');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        const elapsedTime = Date.now() - startTime;
        statsdClient.timing('api.healthCheckStatus.responseTime', elapsedTime);
        return res.status(503).send();
    }
};

module.exports = { healthCheckStatus };
