import User from '../models/user.model.js';
import { AppError } from '../../../utils/AppError.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Return user directly - all role-specific data is now in the user object
  return { user, roleProfile: user };
};

export const updateUserProfile = async (userId, updates) => {
  // Remove immutable fields from updates
  const { name, email, role, passwordHash, ...allowedUpdates } = updates;

  // Check if username is being updated and if it already exists
  if (allowedUpdates.username) {
    const existingUser = await User.findOne({
      username: allowedUpdates.username,
      _id: { $ne: userId }, // Exclude current user
    });

    if (existingUser) {
      throw new AppError(
        409,
        'Username already exists. Please choose a different username.',
      );
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true },
  ).select('-passwordHash');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const updateRoleProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('-passwordHash');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const getChatUsers = async (currentUserId) => {
  // Get all users except the current user, exclude password
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select('username name email avatar role companyName')
    .sort({ username: 1 });

  return users;
};
