import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[0-9]/, "Add at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Add at least 1 symbol");

const matchPasswords = (data) => data.password === data.confirmPassword;
const matchError = { message: "Passwords do not match", path: ["confirmPassword"] };

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email,
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{7,18}$/, "Enter a valid phone number"),
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms and Privacy Policy",
    }),
  })
  .refine(matchPasswords, matchError);

export const companyAccountSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine(matchPasswords, matchError);

export const companyDetailsSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name"),
  website: z
    .string()
    .trim()
    .regex(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i, "Enter a valid website"),
  size: z.string().min(1, "Select company size"),
  industry: z.string().min(1, "Select an industry"),
  role: z.string().min(1, "Select your role"),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine(matchPasswords, matchError);