import cloudinaryUploader from '../utils/upload.js';

const getString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export const uploadAdminImage = async (req, res) => {
  try {
    const image = getString(req.body?.image);

    if (!image) {
      return res.status(400).json({ status: 'error', error: 'Image is required.' });
    }

    const image_url = await cloudinaryUploader(image);

    return res.status(200).json({
      status: 'success',
      data: {
        imageUrl: image_url,
        image_url,
      },
    });
  } catch (error) {
    console.error('Error uploading admin image:', error);
    return res.status(500).json({ status: 'error', error: 'Failed to upload image.' });
  }
};