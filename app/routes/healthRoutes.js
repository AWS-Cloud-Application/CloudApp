const express = require('express');
const { healthCheckStatus } = require('../controller/healthController');

const router = express.Router();

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
};

router.head('/', (req,res) => {res.status(405).header(headers).send();});
router.options('/', (req,res) => {res.status(405).header(headers).send();});

router.get('/', healthCheckStatus);

module.exports = router;
