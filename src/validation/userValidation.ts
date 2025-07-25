import { z } from 'zod';
type UserInput = z.infer<typeof userValidationSchema>;
export const userValidationSchema = z.object({
  fullName: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Full name must contain only letters and spaces'),
  email: z.string().email('Invalid email format'),
  mobileNumber: z.string().min(10).max(15).regex(/^\+?\d{10,15}$/, 'Invalid mobile number'),
  password: z.string(),
  // confirmPassword: z.string().min(6).max(20),
  // otp: z.string().min(6).max(6, 'OTP must be 6 digits'),
  isAgree: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  referredBy: z.string().optional(),
});

export const validateUser = (data: UserInput) => {
  try {
    userValidationSchema.parse(data);
    return null; // validation passed
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err.message;
    } else {
      return 'An unknown error occurred';
    }
  }
};
