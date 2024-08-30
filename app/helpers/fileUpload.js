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
    cb(
      new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."),
      false
    );
  }
};

const fileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB size limit
  },
  fileFilter: fileFilter,
});

const convertToWebP = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }

  const webpFilename = `${uuidv4()}.webp`;
  const webpPath = path.join(__dirname, "../../public/images", webpFilename);

  try {
    // Convert the file buffer to WebP and save it to disk
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Store the WebP image path in the request object for further processing in the controller
    req.file.filename = webpFilename;
    req.file.path = webpPath;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { fileUpload, convertToWebP };
