import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profilePictureUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal(''))
});
