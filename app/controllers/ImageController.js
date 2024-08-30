const ImageController = {
  store: async (req, res) => {
    res.status(200).json({ message: "Stored" });
  },
};

module.exports = ImageController;
