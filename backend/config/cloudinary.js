require('dotenv').config();

const cloudinary            = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer                = require('multer');

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY ? 'exists' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'exists' : 'MISSING'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:        'campus-job-board/cvs',
    resource_type: 'raw',
    format:        'pdf'
  }
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };