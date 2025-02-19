import redis from "connections/redisClient";
import { generateAccessToken, generateRefreshToken } from "./jwt";
import { REFRESH_TOKEN_EXPIRATION } from "config";

const getTokens = (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken
  }
}

/**
 * Generate tokens and save refresh token to redis
 */
export default async function initTokens(userId: string, saveToRedis = true) {
  const { accessToken, refreshToken } = getTokens(userId);
  // Save refresh token to redis
  (saveToRedis && await redis.set(userId, refreshToken, 'EX', REFRESH_TOKEN_EXPIRATION));

  return {
    accessToken,
    refreshToken
  }
}