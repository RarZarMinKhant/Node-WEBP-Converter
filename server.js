const express = require("express");
const app = express();
const router = require("./router/api.js");
require("dotenv").config();

app.use(express.static("public")); //for access public files middleware
app.use(express.urlencoded({ extended: true })); //for post request data middleware

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.use(router);
