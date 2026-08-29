// The auth service's response envelope for POST /api/v1/verify.
// On success `data` is the identity; on failure it is the error message (see the root CLAUDE.md
// "API Response Shape").
export type VerifyEnvelope = {
	success: boolean;
	data: { userId: string } | string;
};
