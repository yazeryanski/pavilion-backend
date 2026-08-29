import env, { SERVICE_NAME } from '@/config';
import type { VerifyEnvelope } from '@/types/auth.types';

/*
	Resolves a bearer access token to a user id by asking the auth service.

	JWT verification lives exclusively in auth, so the gateway cannot check the signature itself
	— it holds no token secret. Returns null when the token is simply bad (auth answers 401);
	throws for anything else, so an unreachable or broken auth service surfaces as a 502 rather
	than being mistaken for an invalid token.
*/
export async function verifyAccessToken(token: string, requestId: string): Promise<string | null> {
	const response = await fetch(`${env.AUTH_SERVICE_URL}/api/v1/verify`, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${token}`,
			'x-service-name': SERVICE_NAME,
			'x-request-id': requestId,
			'x-gateway-secret': env.GATEWAY_SECRET,
		},
	});

	if (response.status === 401) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Auth service responded with ${response.status} while verifying an access token`);
	}

	const body = (await response.json()) as VerifyEnvelope;

	if (!body.success || typeof body.data === 'string') {
		throw new Error('Auth service returned an unexpected verification payload');
	}

	return body.data.userId;
}
