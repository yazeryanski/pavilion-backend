import env, { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from 'config';
import jwt from 'jsonwebtoken';

import type { AccessTokenPayload, RefreshTokenPayload } from 'models/jwt.model';

// #region AccessToken
export const generateAccessToken = (userId: string): string => {
	return jwt.sign({ userId } as AccessTokenPayload, env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
	return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};
// #endregion

// #region RefreshToken
export const generateRefreshToken = (userId: string): string => {
	return jwt.sign({ userId } as RefreshTokenPayload, env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
	return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};
// #endregion
