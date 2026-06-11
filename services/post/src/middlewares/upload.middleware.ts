import multer from 'multer';

const storage = multer.memoryStorage();

const uploadImage = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter: (_req, file, cb) => {
		const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Only JPEG, JPG, PNG, and WebP files are allowed'));
		}
	},
});

export default uploadImage;
