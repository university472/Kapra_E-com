// import { v2 as cloudinary } from 'cloudinary'
// import { CloudinaryStorage } from 'multer-storage-cloudinary'
// import multer from 'multer'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// })

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'kapra-ecom/products',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [
//       { width: 900, height: 1100, crop: 'limit', quality: 'auto' }
//     ]
//   }
// })

// export const upload = multer({ storage })
// export default cloudinary

import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Use memory storage – files will be available as Buffers in `req.files`
const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max per image
})

export default cloudinary
