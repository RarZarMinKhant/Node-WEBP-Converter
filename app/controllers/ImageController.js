const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require("../../database/db");

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

  getImages: async (req, res) => {
    try {
      const baseUrl = 'https://static.hl8888.vip/webpFolders/akgaming/';
      const publicFolder = path.join(__dirname, '../../public/game-images');
      
      if (!fs.existsSync(publicFolder)) {
        fs.mkdirSync(publicFolder, { recursive: true });
      }

      // Fetch image URLs from the database
      const result = await db.query('SELECT image FROM games');
      
      // Process and filter image URLs
      const filteredImageUrls = result.rows
        .map(row => row.image)
        .map(imageUrl => {
          const match = imageUrl.match(/photos\/game-images\/(.+)/);
          return match ? `photos/game-images/${match[1]}` : null;
        })
        .filter(Boolean) // Remove any null values
        .map(filteredUrl => `${baseUrl}${filteredUrl}`);       
      
      // Download each image and save it to the public folder
      await Promise.all(filteredImageUrls.map(async (imageUrl) => {
        const fileName = path.basename(imageUrl);
        const filePath = path.join(publicFolder, fileName);

        const response = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream',
          timeout: 10000
        });

        response.data.pipe(fs.createWriteStream(filePath));
      }));

      res.status(200).json({
        message: "Images fetched and downloaded successfully",
        data: filteredImageUrls
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch and download images',
        error: error.message
      });
    }
  },
};

module.exports = ImageController;














