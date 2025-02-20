import redis from '@/utils/redis';
import asyncHandler from '@utils/asyncHandler';
import initTokens from '@utils/initTokens';
import { verifyRefreshToken } from '@utils/jwt';
import type { Request, Response } from 'express';

const refreshController = async (req: Request, res: Response) => {
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

	const { accessToken, refreshToken: newRefreshToken } = await initTokens(userId);

	res.success({
		accessToken,
		refreshToken: newRefreshToken,
	});
};

export default asyncHandler(refreshController);
