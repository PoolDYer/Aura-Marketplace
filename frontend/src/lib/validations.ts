import { z } from 'zod';

export const userRoleSchema = z.enum(['COMPRADOR', 'VENDEDOR']);

const passwordRules = z.string()
  .min(8, 'Debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener una minuscula')
  .regex(/[A-Z]/, 'Debe contener una mayuscula')
  .regex(/\d/, 'Debe contener un numero');

export const loginSchema = z.object({
  email: z.string().email('Correo invalido'),
  password: z.string().min(1, 'La contrasena es requerida'),
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo invalido'),
  rol: userRoleSchema.default('COMPRADOR'),
  password: passwordRules,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo invalido'),
});

export const resetPasswordSchema = z.object({
  password: passwordRules,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
