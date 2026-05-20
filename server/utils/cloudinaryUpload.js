const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, originalname) => {
  const extension = originalname?.split('.').pop()?.toLowerCase() || 'pdf';
  const resourceType = extension === 'pdf' ? 'raw' : 'raw';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ats-resumes',
        resource_type: resourceType,
        format: extension,
        public_id: `resume-${Date.now()}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = { uploadBufferToCloudinary };
