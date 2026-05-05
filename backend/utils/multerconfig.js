const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../controllers/images");

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    // Log the directory path where the file will be saved
    // console.log("File will be saved to:", uploadDir);
    
    cb(null, uploadDir); // Specify the directory to save files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = uniqueSuffix + path.extname(file.originalname); // Save file with a unique name

    // Log the file name that is being saved
    // console.log("File name after processing:", fileName);

    cb(null, fileName); 
  },
});

// Filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  
  // Log the MIME type of the file being uploaded
//   console.log("Uploaded file MIME type:", file.mimetype);

  if (allowedTypes.includes(file.mimetype)) {
    // console.log("File type is allowed.");
    cb(null, true); // Accept file
  } else {
    // console.log("File type is NOT allowed.");
    cb(new Error("Only JPEG, PNG, and JPG files are allowed"), false); // Reject file
  }
};

// Initialize Multer with the configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;
