import { z } from 'zod'

export const SignUpSchema = z.object({
  full_name: z.string().min(2, { error: 'Name must be at least 2 characters.' }).trim(),
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
  phone: z
    .string()
    .min(7, { error: 'Enter a valid phone number.' })
    .max(20, { error: 'Phone number is too long.' })
    .regex(/^[+\d\s\-()]+$/, { error: 'Enter a valid phone number.' })
    .trim(),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Password must contain at least one number.' }),
})

export const SignInSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Password is required.' }),
})

export const ResetPasswordSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
})

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters.' })
      .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
      .regex(/[0-9]/, { error: 'Password must contain at least one number.' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: 'Passwords do not match.',
    path: ['confirm_password'],
  })

export type SignUpInput = z.infer<typeof SignUpSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>
