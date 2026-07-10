import z from 'zod';

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
    message:
      'Password must contain at least one letter and one number, and can include special characters @$!%*#?&^_-',
  });

const role = z.enum(['learner', 'employer', 'regulator'], {
  errorMap: () => ({ message: 'invalid role selected' }),
});

const name = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters long' })
  .max(100, { message: 'Name must be less than 100 characters long' })
  .regex(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  });

export const loginValidation = z.object({
  email,
  password,
  role,
});

export const signupValidation = z.object({
  name,
  email,
  password,
  role,
});
