import redis from '@/utils/redis';
import asyncHandler from '@utils/asyncHandler';
import { verifyRefreshToken } from '@utils/jwt';

import type { NextFunction, Request, Response } from 'express';

export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.body.refreshToken) {
		res.error('Refresh token is required', 400);
		return;
	}

	const refreshToken = req.body.refreshToken.trim();
	const { userId } = verifyRefreshToken(refreshToken);
	const storedToken = await redis.get(userId);

	if (refreshToken !== storedToken) {
		res.error('Invalid refresh token', 400);
		return;
	}

	req.body.userId = userId;
	req.body.refreshToken = refreshToken;

	next();
};

export default asyncHandler(validateRefreshToken);
