import { DEFAULT_USER_NAME } from '@/config';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

export const userIdSchema = z.string({ message: 'Invalid user ID' }).uuid({ message: 'Invalid user ID' });

export const sanitizedString = z.string().transform((v) => sanitizeHtml(v));

export const userNameSchema = sanitizedString.optional().default(DEFAULT_USER_NAME);

export const userAvatarSchema = sanitizedString.nullable().optional();
