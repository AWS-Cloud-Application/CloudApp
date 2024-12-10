const { s3 } = require('../databaseConfig/awsConfig');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/imageModel');

// Function to upload an image
const uploadImage = async (fileBuffer, fileName, userId) => {
  //console.log("Inside image service")
  //console.log("S3 instance:", s3);
  const imageId = uuidv4();
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${userId}/${fileName}`,
    Body: fileBuffer,
    ContentType: 'jpg/jpeg',
    ACL: 'private',
    ServerSideEncryption: 'AES256',
  };

  //console.log("uploadParams", uploadParams)

  await s3.upload(uploadParams).promise();

  const imageMetadata = {
    id: imageId,
    file_name: fileName,
    url: `${process.env.S3_BUCKET_NAME}/${userId}/${fileName}`,
    upload_date: new Date(),
    user_id: userId,
  };

  //console.log("imageMetadata", imageMetadata)

  return Image.create(imageMetadata);
};

// Function to get an image
const getImage = async (userId) => {
  return Image.findOne({ where: { user_id: userId } });
};

// Function to delete an image
const deleteImage = async (userId) => {
  const imageRecord = await getImage(userId);
  if (!imageRecord) throw new Error('Image not found');

  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${userId}/${imageRecord.file_name}`,
  };

  // Delete from S3
  await s3.deleteObject(deleteParams).promise();

  // Delete from database
  return Image.destroy({ where: { user_id: userId } });
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage,
};
