import { z } from 'zod';

/* ---------------- Shared Fields ---------------- */

const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must be less than 100 characters long');

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Please enter a valid email address' }));

const password = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters long' })
  .max(100, { message: 'Password must be less than 100 characters long' })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{6,}$/, {
    message: 'Password must contain at least one letter and one number.',
  });

const organizationType = z.enum([
  'higher-education',
  'corporate-training',
  'government',
  'non-profit',
]);

const website = z
  .string()
  .trim()
  .pipe(z.url({ message: 'Please enter a valid website URL' }));

/* ---------------- Learner ---------------- */

const learnerSchema = z
  .object({
    accountType: z.literal('learner'),
    name,
    email,
    password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

/* ---------------- Organization ---------------- */

const organizationSchema = z
  .object({
    accountType: z.literal('organization'),

    organizationName: name,
    officialEmail: email,
    password,
    website,
    organizationType,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

/* ---------------- Login ---------------- */

export const loginSchema = z.object({
  email,
  password,
});

/* ---------------- Signup ---------------- */

export const signupSchema = z.discriminatedUnion('accountType', [
  learnerSchema,
  organizationSchema,
]);
