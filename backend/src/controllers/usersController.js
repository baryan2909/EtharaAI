const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if environment keys are defined
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * @desc    Get all registered users (useful for project assignment & Admin dashboard)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('name');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged-in user profile details (name, email)
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Check if new email is already taken by a different user
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, error: 'Email is already taken by another account' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload avatar to Cloudinary and update user record
 * @route   PUT /api/users/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image file' });
    }

    const userId = req.user._id;

    // Helper: Verify if Cloudinary is configured
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      // Upload via stream using multer memory buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'collabflow_avatars',
          transformation: [{ width: 200, height: 200, crop: 'thumb', gravity: 'face' }]
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return res.status(500).json({ success: false, error: 'Cloudinary upload failed. Please try again.' });
          }

          // Save URL in MongoDB
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: result.secure_url },
            { new: true }
          );

          return res.status(200).json({
            success: true,
            avatar: updatedUser.avatar,
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              avatar: updatedUser.avatar
            }
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } else {
      // Graceful offline mock: convert the image buffer to a base64 Data URI for local persistence!
      console.log('Cloudinary not configured. Gracefully falling back to Base64 buffer representation...');
      
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const mimeType = req.file.mimetype || 'image/png';
      const mockDataUri = `data:${mimeType};base64,${b64}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: mockDataUri },
        { new: true }
      );

      res.status(200).json({
        success: true,
        avatar: updatedUser.avatar,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
