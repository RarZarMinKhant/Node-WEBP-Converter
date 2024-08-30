const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

// Define allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationPath = path.join(__dirname, "../../public/images");
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

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

  const originalPath = path.join(
    __dirname,
    "../../public/images",
    req.file.filename
  );
  const webpFilename = `${uuidv4()}.webp`;
  const webpPath = path.join(__dirname, "../../public/images", webpFilename);

  try {
    await sharp(originalPath).webp({ quality: 80 }).toFile(webpPath);

    // Store the WebP image path in the request object for further processing in the controller
    req.file.webpFilename = webpFilename;
    req.file.webpPath = webpPath;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { fileUpload, convertToWebP };
