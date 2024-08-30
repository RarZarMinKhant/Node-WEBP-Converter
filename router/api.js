const express = require("express");
const router = express.Router();
const ImageController = require("../app/controllers/ImageController.js");
const { fileUpload, convertToWebP } = require("../app/helpers/fileUpload.js");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome" });
});

router.post(
  "/image/store",
  fileUpload,
  convertToWebP,
  ImageController.store
);

// 404 Error Handler
router.use((req, res) => {
  res.status(404).json({ message: "404 page not found" });
});

// Error Handling Middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = router;
