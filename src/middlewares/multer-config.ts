import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Invalid file type. Only JPG, PNG are allowed.")
      );
    }
    callback(null, true);
  },
});

export const uploadMiddleware = upload.single("imageFile");
