import { z } from 'zod';

export const providerValidationSchema = z
  .object({
    name: z
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

    address: z.string().min(5, 'Address is too short'),

    companyLogo: z.string().url('Invalid logo URL').optional(),

    identityType: z.enum(['passport', 'driving license', 'other'], {
      required_error: 'Identity type is required',
    }),

    identityNumber: z.string().min(5, 'Identity number is too short'),

    identificationImage: z.string().url('Invalid identification image URL'),

    contactPerson: z.object({
      name: z
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
    }),

    accountInformation: z.object({
      email: z.string().email('Invalid email format'),
      phoneNo: z
        .string()
        .min(10)
        .max(15)
        .regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
    }),

    password: z
      .string()
      .min(6)
      .max(20)
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

    confirmPassword: z.string().min(6).max(20),

    addressLatitude: z.number().min(-90).max(90),
    addressLongitude: z.number().min(-180).max(180),

    setBusinessPlan: z.enum(['commission base', 'other'], {
      required_error: 'Business plan is required',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(data => data.accountInformation.email === data.email, {
    message: 'Account email must match provider email',
    path: ['accountInformation', 'email'],
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
