import { z } from 'zod';

export const startSessionSchema = z.object({
  userId: z.string().min(1),
  gameId: z.string().min(1)
});

export const stopSessionSchema = z.object({
  sessionId: z.string().min(1)
});
