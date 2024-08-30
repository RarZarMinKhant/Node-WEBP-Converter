const ImageController = {
  store: async (req, res) => {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({
        message: "Image upload failed",
      });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: `${process.env.APP_URL}` + "/images/" + req.file.filename,
    });
  },
};

module.exports = ImageController;
