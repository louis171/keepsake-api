const express = require("express");
const multer = require("multer");
const { nanoid } = require("nanoid");
const DIR = "./public/";

const limits = {
  fields: 20,
  fileSize: 10 * 1024 * 1024, // 10 Mb
  files: 1,
  parts: 20
};

// Handles destination and building filename
// Filename: rng string from nanoid concat original filename with spaces replaced with hyphens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const rng = nanoid(16);
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, rng + "!" + fileName);
  },
});

// Handles save to disk
// Checks for file type and returns error if the incorrect filetype
const handleUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
    }
  },
  limits: limits
}).single("userImageUpload");

const noUpload = multer().none();

const multerConfig = {
  handleUpload: handleUpload,
  noUpload: noUpload,
};

module.exports = multerConfig;
