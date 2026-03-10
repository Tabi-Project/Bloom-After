const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export const cloudinaryUploader = async (image) => {
    try {
        const result = await cloudinary.uploader.upload(image, {
            folder: 'uploads',
            use_filename: true,
            unique_filename: false,
            overwrite: true
        })
        return result.secure_url
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error)
        throw error
    }
}