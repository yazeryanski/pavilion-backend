import initTokens from '@utils/initTokens';
import { verifyRefreshToken } from '@utils/jwt';
import redis from 'connections/redisClient';
import type { Request, Response } from 'express';

export default async function refreshController(req: Request, res: Response) {
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

}
