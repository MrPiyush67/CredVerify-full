import User from './user.model.js';
import { hashPassword, comparePassword } from '../../core/utils/hashPassword.js';
import { generateToken } from '../../core/utils/generateToken.js';
import { ROLES } from '../../core/constants/roles.js';

export const createUser = async (userData) => {
  const { username, name, email, password, role, ...profileData } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Auto-generate unique username if not provided
  let finalUsername = username;
  if (!finalUsername) {
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    finalUsername = baseUsername;

    // Check if username exists and append random suffix if needed
    let usernameExists = await User.findOne({ username: finalUsername });
    if (usernameExists) {
      // Generate unique suffix using timestamp + random number
      const uniqueSuffix = Date.now().toString().slice(-4) + Math.floor(Math.random() * 1000);
      finalUsername = `${baseUsername}${uniqueSuffix}`;

      // Final safety check (extremely rare collision)
      usernameExists = await User.findOne({ username: finalUsername });
      if (usernameExists) {
        finalUsername = `${baseUsername}${Date.now()}${Math.floor(Math.random() * 10000)}`;
      }
    }
  }

  // Create user with all data (base + role-specific fields)
  const user = await User.create({
    username: finalUsername,
    name, // Legal name - immutable
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
  // Remove immutable fields from updates
  const { name, email, role, passwordHash, ...allowedUpdates } = updates;
  
  // Check if username is being updated and if it already exists
  if (allowedUpdates.username) {
    const existingUser = await User.findOne({ 
      username: allowedUpdates.username,
      _id: { $ne: userId } // Exclude current user
    });
    
    if (existingUser) {
      throw new Error('Username already exists. Please choose a different username.');
    }
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

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
    .select('username name email avatar role companyName')
    .sort({ username: 1 });

  return users;
};
