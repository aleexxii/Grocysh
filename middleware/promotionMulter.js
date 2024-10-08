const multer = require('multer')
require('path');


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/amale/OneDrive/Desktop/Grocyish/public/user/assets/images/promotionImages') // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Use the original filename
    }
});

// Multer instance with configured storage
const promotionImgulter = multer({ storage: storage });

module.exports = promotionImgulter