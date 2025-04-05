import { DEFAULT_USER_NAME } from '@/config';
import { z } from 'zod';

export const userIdSchema = z.string({ message: 'Invalid user ID' }).uuid({ message: 'Invalid user ID' });

export const userNameSchema = z.string().optional().default(DEFAULT_USER_NAME);
