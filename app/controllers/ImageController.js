const ImageController = {
  store: async (req, res) => {
    if (!req.convertedFiles || req.convertedFiles.length === 0) {
      return res.status(400).json({
        message: "Image upload failed",
      });
    }

    // Construct the URLs for all uploaded WebP images using the APP_URL environment variable
    const imageUrls = req.convertedFiles.map(file => `${process.env.APP_URL}/images/${file.filename}`);

    res.status(200).json({
      message: "Images uploaded successfully",
      data: imageUrls
    });
  },
};

module.exports = ImageController;
