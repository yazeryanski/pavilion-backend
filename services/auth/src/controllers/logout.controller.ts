import redis from '@/utils/redis';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const logoutController = async (req: Request, res: Response) => {
	const { userId } = req.body;

	if (!userId) {
		throw new Error('Middleware is missing. UserId is required');
	}

	// Delete refresh token from Redis
	await redis.del(userId);

	// Clear cookies
	res.clearCookie('refreshToken');
	res.clearCookie('accessToken');

	res.success('Logged out successfully');
};

export default asyncHandler(logoutController);
