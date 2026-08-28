import { userIdSchema } from '@/schemas/common.schema';
import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const removeFriendController = async (req: Request, res: Response) => {
	const userId = userIdSchema.parse(req.params.userId);
	const friendId = userIdSchema.parse(req.params.friendId);

	try {
		const profile = await prisma.profile.findUnique({ where: { userId } });

		if (!profile) {
			res.error('Profile not found', 404);
			return;
		}

		const updatedProfile = await prisma.profile.update({
			where: { userId },
			data: { friendIds: { set: profile.friendIds.filter((id) => id !== friendId) } },
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

export default asyncHandler(removeFriendController);
