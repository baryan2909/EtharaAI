const express = require('express');
const multer = require('multer');
const { getAllUsers, updateProfile, uploadAvatar } = require('../controllers/usersController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Multer memory-storage setup with constraints
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format error: Only image uploads are permitted (jpeg, png, WebP)'), false);
    }
  }
});

// Mount routes with protection guards
router.get('/', protect, authorize('Admin'), getAllUsers);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
