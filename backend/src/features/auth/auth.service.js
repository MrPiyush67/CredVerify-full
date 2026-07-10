import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { flattenError } from 'zod';
import { AppError } from '#src/utils/AppError.js';
import { config } from '#src/config/env.js';
import User from '../users/user.model.js';
import Organization from '../organizations/org.model.js';
import { signupSchema, loginSchema } from './validation.service.js';

export const signupUser = async (data) => {
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    const flattenedError = flattenError(result.error);
    throw new AppError(400, 'Invalid input data', flattenedError.fieldErrors);
  }

  let { accountType, email, name, password } = result.data;
  let role = 'learner';
  let orgId = null;

  if (accountType === 'organization') {
    const { officialEmail } = result.data;
    role = 'organization_admin';
    name = 'Administrator';
    email = officialEmail;

    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      throw new AppError(409, 'Organization already exist');
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, 'User already exists');
  }

  if (accountType === 'organization') {
    const { organizationName, organizationType, website } = result.data;
    const org = await Organization.create({
      name: organizationName,
      type: organizationType,
      website,
      email,
    });
    orgId = org._id;
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
    organization: orgId,
  });

  // Generate token
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  return { user, token };
};

export const loginUser = async (data) => {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const flattenedError = flattenError(result.error);
    throw new AppError(400, 'Invalid input data', flattenedError.fieldErrors);
  }

  const { email, password } = result.data;

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
