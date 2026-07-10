import User from '../models/user.model.js';
import { AppError } from '../../../utils/AppError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { flattenError } from 'zod';
import { config } from '#src/config/env.js';
import { signupValidation } from './validation.service.js';


export const signupUser = async (data) => {
  const result = signupValidation.safeParse(data);

  if (!result.success) {
    const flattenedError = flattenError(result.error);
    throw new AppError(400, 'Invalid input data', flattenedError.fieldErrors);
  }

  const { name, email, password, role } = result.data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'User already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Auto-generate unique username (almost always unique)
  const username = `${name.split(' ')[0].toLowerCase()}${crypto.randomUUID().slice(0, 8)}`;

  const user = await User.create({
    username,
    name,
    email,
    passwordHash,
    role,
  });

  // Generate token
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  return { user, token };
};

export const loginUser = async (data) => {
  const { email, password } = data;

  // Find user with password
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Generate token
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  // Remove password from response
  user.passwordHash = undefined;

  return { user, token };
};
