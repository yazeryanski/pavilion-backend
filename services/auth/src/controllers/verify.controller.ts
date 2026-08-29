import asyncHandler from '@utils/asyncHandler';
import { verifyAccessToken } from '@utils/jwt';
import type { Request, Response } from 'express';

/*
	Token introspection for the API gateway.

	JWT verification lives exclusively in this service, so the gateway cannot check an access
	token itself — it presents the bearer token here and gets back the identity it should inject
	as `x-user-id` downstream. This endpoint is never exposed publicly: the gateway blocks
	`/api/v1/auth/verify` from the outside.
*/
const verifyController = async (req: Request, res: Response) => {
	const [scheme, token] = (req.headers.authorization ?? '').split(' ');

	if (scheme !== 'Bearer' || !token) {
		res.error('Missing access token', 401);
		return;
	}

	try {
		const { userId } = verifyAccessToken(token);

		res.success({ userId });
	} catch {
		// jsonwebtoken throws for a bad signature, a malformed token and an expired one alike;
		// none of them are worth distinguishing for the caller.
		res.error('Invalid or expired access token', 401);
	}
};

export default asyncHandler(verifyController);
