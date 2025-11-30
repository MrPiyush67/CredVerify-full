import User from './user.model.js';
import { hashPassword, comparePassword } from '../../core/utils/hashPassword.js';
import { generateToken } from '../../core/utils/generateToken.js';
import { ROLES } from '../../core/constants/roles.js';

export const createUser = async (userData) => {
  const { name, email, password, role, ...profileData } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with all data (base + role-specific fields)
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    ...profileData, // Role-specific fields are optional and will be ignored if not for this role
  });

  // Generate token
  const token = generateToken(user._id);

  return { user, token };
};

export const authenticateUser = async (email, password) => {
  // Find user with password
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.passwordHash = undefined;

  return { user, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  // Return user directly - all role-specific data is now in the user object
  return { user, roleProfile: user };
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateRoleProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const getChatUsers = async (currentUserId) => {
  // Get all users except the current user, exclude password
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select('name email avatar role companyName')
    .sort({ name: 1 });

  return users;
};
