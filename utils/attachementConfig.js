const multer = require("multer");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/attachments/"); // Dossier où les images seront stockées
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nom du fichier unique
    }
});

// Configuration du filtre
const fileUpload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.webp' && ext !== '.jfif' && ext !== '.avif' && ext !== '.tiff' && ext !== '.bmp') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
});

module.exports = fileUpload;
