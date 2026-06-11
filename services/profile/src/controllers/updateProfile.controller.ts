import { userAvatarSchema, userIdSchema, userNameSchema } from '@/schemas/common.schema';
import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const updateProfileController = async (req: Request, res: Response) => {
	// read from params
	const userId = userIdSchema.parse(req.params.userId);
	// read from body
	const name = userNameSchema.parse(req.body.name);
	const avatar = userAvatarSchema.parse(req.body.avatar);

	try {
		const updatedProfile = await prisma.profile.update({
			where: {
				userId,
			},
			data: {
				name,
				avatar,
			},
		});

		res.success(updatedProfile, 200);
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === 'P2025') {
				res.error('Profile not found', 404);
				return;
			}
		}

		throw err;
	}
};
export default asyncHandler(updateProfileController);
