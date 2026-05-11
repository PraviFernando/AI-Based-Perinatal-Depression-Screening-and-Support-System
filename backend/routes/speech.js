const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const multer = require('multer');
const path = require('path');

// Configure multer for temporary audio storage
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        // Accept common audio types or files without extensions (common in web blobs)
        if (file.mimetype.startsWith('audio/') ||
            file.originalname === 'blob' ||
            /\.(mp3|wav|m4a|webm|ogg|aac)$/i.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    },
});

router.post('/transcribe', upload.single('audio'), speechController.transcribe);

module.exports = router;
