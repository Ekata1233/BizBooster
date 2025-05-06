import { z } from 'zod';

export const userValidationSchema = z.object({
    firstName: z.string().min(2).max(30).regex(/^[A-Za-z]+$/, 'First name must be alphabetic'),
    lastName: z.string().min(2).max(30).regex(/^[A-Za-z]+$/, 'Last name must be alphabetic'),
    email: z.string().email('Invalid email format'),
    mobileNumber: z.string().min(10).max(15).regex(/^\+?\d{10,15}$/, 'Invalid mobile number'),
    password: z.string().min(6).max(20)
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(6).max(20),
    isAgree: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  

export const validateUser = (data: any) => {
  try {
    userValidationSchema.parse(data);
    return null;  // validation passed
  }  catch (err: unknown) {
    if (err instanceof Error) {
      return err.message; // or err.errors if it's part of the Error object
    } else {
      return 'An unknown error occurred';
    }
  }
};
