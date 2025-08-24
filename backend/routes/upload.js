const express = require("express")
const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Upload single image
router.post("/image", adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64")
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "quickmart",
      resource_type: "auto",
    })

    res.json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Error uploading image", error: error.message })
  }
})

// Upload multiple images
router.post("/images", adminAuth, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" })
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64")
      const dataURI = "data:" + file.mimetype + ";base64," + b64

      return cloudinary.uploader.upload(dataURI, {
        folder: "quickmart",
        resource_type: "auto",
      })
    })

    const results = await Promise.all(uploadPromises)

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }))

    res.json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Error uploading images", error: error.message })
  }
})

// Delete image
router.delete("/image/:publicId", adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params

    await cloudinary.uploader.destroy(publicId)

    res.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ message: "Error deleting image", error: error.message })
  }
})

module.exports = router
