const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const axios = require("axios");

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const storage = multer.memoryStorage();

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
    fileSize: 1024 * 1024 * 5, // 5 MB size limit per file
  },
  fileFilter: fileFilter,
}).array("images", 10); // Allow up to 10 files at once

const processImageUrls = async (req, res, next) => {
  const { urls } = req.body;

  if (urls) {
    try {
      const urlFiles = [];

      for (const url of JSON.parse(urls)) {
        try {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });

          const contentType = response.headers["content-type"];
          if (!ALLOWED_FILE_TYPES.includes(contentType)) {
            return next(
              new Error(
                "Invalid file type in URL. Only JPG, JPEG, and PNG are allowed."
              )
            );
          }

          urlFiles.push({
            originalname: path.basename(url),
            buffer: Buffer.from(response.data),
            mimetype: contentType,
          });
        } catch (error) {
          return next(
            new Error(`Failed to process URL: ${url}. Error: ${error.message}`)
          );
        }
      }

      // Combine files from upload and URL processing
      req.files = req.files ? req.files.concat(urlFiles) : urlFiles;
    } catch (err) {
      return next(err);
    }
  }
  next();
};

const convertToWebP = async (req, res, next) => {
  if (
    (!req.files || req.files.length === 0) &&
    (!req.body.urls || req.body.urls.length === 0)
  ) {
    return next(new Error("No files or URLs provided"));
  }

  try {
    const webpFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const webpFilename = `${uuidv4()}.webp`;
        const webpPath = path.join(
          __dirname,
          "../../public/images",
          webpFilename
        );

        await sharp(file.buffer).webp({ quality: 80 }).toFile(webpPath);

        webpFiles.push({
          filename: webpFilename,
          path: webpPath,
        });
      }
    }

    // Store the array of WebP image paths in a separate property
    req.convertedFiles = webpFiles;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { fileUpload, processImageUrls, convertToWebP };
