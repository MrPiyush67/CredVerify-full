import { config } from '../config/index.js';

// Mock user database
export const mockUsers = {
  [config.mockUser.email]: {
    email: config.mockUser.email,
    password: config.mockUser.password, // In real app, this would be hashed
    name: config.mockUser.name,
    dob: config.mockUser.dob,
    aadhaar: config.mockUser.aadhaar,
    userId: 'mock-user-001'
  }
};

// Get user by email
export function getUserByEmail(email) {
  return mockUsers[email];
}

// Get user by userId
export function getUserById(userId) {
  return Object.values(mockUsers).find(u => u.userId === userId);
}

// Validate user credentials
export function validateCredentials(email, password) {
  const user = mockUsers[email];
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}
