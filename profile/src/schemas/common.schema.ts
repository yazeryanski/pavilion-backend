import { z } from 'zod';

export const userIdSchema = z.string().uuid({ message: 'Invalid user ID' });
