const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.dmn8pqdon,
  api_key:    process.env.633987236143715,
  api_secret: process.env.gwEWUsnsLCOs34XPoCFJWYbbNuI,
});

module.exports = cloudinary;