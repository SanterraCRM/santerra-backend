import { z } from "zod";

import { passwordSchema } from "../../../../shared/http/request-schemas";

export const createCompanySchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});

export const signUpSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: passwordSchema,
  companyName: z.string(),
  verificationToken: z.string().min(1),
});

export const sendEmailVerificationSchema = z.object({
  email: z.email(),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const selectCompanySchema = z.object({
  companyId: z.uuid(),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
