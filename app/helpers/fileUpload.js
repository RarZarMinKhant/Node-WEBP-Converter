const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."), false);
  }
};

const fileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB size limit per file
  },
  fileFilter: fileFilter,
}).array("images", 10); // Allow up to 10 files at once

const convertToWebP = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new Error("No files uploaded"));
  }

  try {
    const webpFiles = [];

    for (const file of req.files) {
      const webpFilename = `${uuidv4()}.webp`;
      const webpPath = path.join(__dirname, "../../public/images", webpFilename);

      await sharp(file.buffer).webp({ quality: 80 }).toFile(webpPath);

      webpFiles.push({
        filename: webpFilename,
        path: webpPath,
      });
    }

    // Store the array of WebP image paths in a separate property
    req.convertedFiles = webpFiles;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { fileUpload, convertToWebP };
