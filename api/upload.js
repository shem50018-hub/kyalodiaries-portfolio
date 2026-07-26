const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password, slot, image } = req.body || {};

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Wrong password' });
    }

    const slotNum = parseInt(slot, 10);
    if (!slotNum || slotNum < 1 || slotNum > 5) {
        return res.status(400).json({ error: 'Slot must be between 1 and 5' });
    }

    if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
        return res.status(400).json({ error: 'No valid image provided' });
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
        return res.status(200).json({ url: result.secure_url, slot: slotNum });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Upload failed' });
    }
};