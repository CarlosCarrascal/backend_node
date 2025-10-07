import cloudinary from "cloudinary";

// Configurar Cloudinary v1
const cloudinaryV1 = cloudinary.v2;

cloudinaryV1.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinaryV1;


