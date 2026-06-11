import { userIdSchema } from '@/schemas/common.schema';
import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const getProfileController = async (req: Request, res: Response) => {
	const userId = userIdSchema.parse(req.params.userId);

	const profile = await prisma.profile.findUnique({
		where: {
			userId,
		},
	});

	if (!profile) {
		res.error('Profile not found', 404);
		return;
	}

	res.success(profile);
	return;
};
export default asyncHandler(getProfileController);
