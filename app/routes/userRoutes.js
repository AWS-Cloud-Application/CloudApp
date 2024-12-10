const express = require('express');
const { createUserController, getUserController, updateUserController, verifyUserController } = require('../controller/userController');
const basicAuthorization = require('../middleware/authMiddleware');
const { healthCheck } = require('../services/healthService');
const { verifyUserMiddleware } = require('../middleware/verifyUserMiddleware');

const router = express.Router();

// Health check function embedded in each route
const checkDatabaseConnection = async (req, res, next) => {
    const isDatabaseConnected = await healthCheck();

    if (isDatabaseConnected) {
        next();
    } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        return res.status(503).send('Service Unavailable: Database Connection Failed');
    }
};

router.use(checkDatabaseConnection);

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
};

router.head('/user/self', (req,res) => {res.status(405).header(headers).send();});
router.head('/user', (req,res) => {res.status(405).header(headers).send();});
router.options('/user', (req,res) => {res.status(405).header(headers).send();});
router.options('/user/self', (req,res) => {res.status(405).header(headers).send();});

router.post('/user', createUserController);

router.get('/user/self', basicAuthorization, verifyUserMiddleware, getUserController);
router.put('/user/self', basicAuthorization, verifyUserMiddleware, updateUserController);

router.get('/user/verify/:token', verifyUserController);

router.all('/user', (req,res) => {res.status(405).header(headers).send();});
router.all('/user/self', (req,res) => {res.status(405).header(headers).send();});

module.exports = router;
