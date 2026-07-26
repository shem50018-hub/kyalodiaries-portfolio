const cloudinary = require('cloudinary').v2;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { password, slot, image } = payload;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Wrong password' }) };
  }

  const slotNum = parseInt(slot, 10);
  if (!slotNum || slotNum < 1 || slotNum > 5) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Slot must be between 1 and 5' }) };
  }

  if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid image provided' }) };
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(image, {
      public_id: `gallery_${slotNum}`,
      overwrite: true,
      invalidate: true,
      format: 'jpg',
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: result.secure_url, slot: slotNum }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Upload failed' }) };
  }
};
