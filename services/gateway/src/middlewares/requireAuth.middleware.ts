import { verifyAccessToken } from '@/services/authClient';
import asyncHandler from '@utils/asyncHandler';
import type { NextFunction, Request, Response } from 'express';

/*
	Terminates the client's bearer token and puts the resolved identity on the request, where
	createServiceProxy picks it up as the outbound x-user-id.

	Guards every proxied route except the auth passthrough — logging in cannot require being
	logged in.
*/
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	const [scheme, token] = (req.headers.authorization ?? '').split(' ');

	if (scheme !== 'Bearer' || !token) {
		res.error('Missing access token', 401);
		return;
	}

	const userId = await verifyAccessToken(token, req.requestId);

	if (!userId) {
		res.error('Invalid or expired access token', 401);
		return;
	}

	req.userId = userId;

	next();
};

export default asyncHandler(requireAuth);
