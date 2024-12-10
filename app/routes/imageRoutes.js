const express = require('express');
const { addProfilePic, getProfilePic, deleteProfilePic } = require('../controller/imageController');
const basicAuthorization = require('../middleware/authMiddleware');
const upload = require('../middleware/imageMiddleware');
const { verifyUserMiddleware } = require('../middleware/verifyUserMiddleware');

const router = express.Router();

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
};

router.head('/', (req,res) => {res.status(405).header(headers).send();});
router.options('/', (req,res) => {res.status(405).header(headers).send();});

router.post('/', basicAuthorization, verifyUserMiddleware, upload, addProfilePic);
router.get('/', basicAuthorization, verifyUserMiddleware, getProfilePic);
router.delete('/', basicAuthorization, verifyUserMiddleware, deleteProfilePic);

router.all('/', (req,res) => {res.status(405).header(headers).send();});

module.exports = router;
