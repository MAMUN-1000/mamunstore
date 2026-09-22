import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/token.js';

/**
 * Register a new customer
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.status = 400;
    throw error;
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create user in database
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'CUSTOMER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // 4. Generate JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { user, token };
};

/**
 * Login user with email and password
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // 2. Compare password hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // 3. Sanitize user object (never send back the password hash)
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  // 4. Generate JWT
  const token = generateToken({
    id: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
    name: safeUser.name,
  });

  return { user: safeUser, token };
};

/**
 * Retrieve user profile by ID
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  return user;
};
