import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address')

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  email,
  name: z.string().trim().min(2, 'Enter your name'),
  password: z.string().min(8, 'Use at least 8 characters'),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
