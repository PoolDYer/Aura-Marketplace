import { z } from 'zod';

export const userRoleSchema = z.enum(['COMPRADOR', 'VENDEDOR']);

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo inválido'),
  rol: userRoleSchema.default('COMPRADOR'),
  password: z.string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'Debe contener una minúscula')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/\d/, 'Debe contener un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
