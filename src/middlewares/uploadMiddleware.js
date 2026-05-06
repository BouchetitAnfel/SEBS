const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadDir = 'uploads/events';

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir , {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req , file , cb) =>{
        cb(null , uploadDir);
    },
    filename: (req , file , cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9);
        const ext = path.extname(file.originalname);
        cb(null, `event-${uniqueSuffix}${ext}`);
    },
});

// Only accept image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true); // accept
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'), false);
    }
};

// Create the upload instance with limits
const uploadEventImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = { uploadEventImage };