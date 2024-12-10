const multer = require('multer');

// Configure multer with file filtering
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    // Check if the field name is 'profilePic'
    if (file.fieldname !== 'profilePic') {
      req.fileValidationError = 'Invalid field name. Use "profilePic".';
      return cb(null, false);
    }

    // Check if the file type is valid
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      req.fileValidationError = 'Only jpg, jpeg, and png files are allowed.';
      return cb(null, false);
    }

    cb(null, true);
  }
}).single('profilePic');

module.exports = upload;
