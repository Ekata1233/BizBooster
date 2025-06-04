import { z } from 'zod';

// Sub-schemas

const locationSchema = z.object({
  type: z.enum(['home', 'office', 'other']),
  coordinates: z
    .array(z.number())
    .length(2, { message: 'Coordinates must contain exactly two numbers' }),
});

const storeInfoSchema = z.object({
  storeName: z.string().min(2).max(100),
  storePhone: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
  storeEmail: z.string().email('Invalid email format'),
  module: z.string().length(24, 'Invalid module ID'),
  zone: z.string().length(24, 'Invalid zone ID'),
  tax: z.string().min(1),
  location: locationSchema,
  address: z.string().min(5),
  officeNo: z.string().min(1),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
});

const kycSchema = z.object({
 
});

// Main schema

export const providerValidationSchema = z
  .object({
    fullName: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-z ]+$/, 'Name must contain only letters and spaces'),

    phoneNo: z
      .string()
      .min(10)
      .max(15)
      .regex(/^\+?\d{10,15}$/, 'Invalid phone number'),

    email: z.string().email('Invalid email format'),

    password: z
      .string()
      .min(6)
      .max(20)
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

    confirmPassword: z.string().min(6).max(20),

    referralCode: z.string().optional(),
    referredBy: z.string().optional(),

    storeInfo: storeInfoSchema,

    kyc: kycSchema,

    setBusinessPlan: z.enum(['commission base', 'other']).optional(),

    isVerified: z.boolean().optional(),

    isDeleted: z.boolean().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ProviderInput = z.infer<typeof providerValidationSchema>;

export const validateProvider = (data: ProviderInput) => {
  try {
    providerValidationSchema.parse(data);
    return null; // Validation passed
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return err.errors.map(e => e.message).join(', ');
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return 'An unknown error occurred';
    }
  }
};
