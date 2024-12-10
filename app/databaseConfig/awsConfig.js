const AWS = require('aws-sdk');

require('dotenv').config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

module.exports = { s3 };
