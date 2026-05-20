const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ats-resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

const memoryStorage = multer.memoryStorage();

const cloudinaryUpload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits,
});

const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter,
  limits,
});

module.exports = cloudinaryUpload.single('resume');
module.exports.memoryUpload = memoryUpload.single('resume');
