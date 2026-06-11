import { userIdSchema, userNameSchema } from '@/schemas/common.schema';
import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const createProfileController = async (req: Request, res: Response) => {
	const userId = userIdSchema.parse(req.body.userId);
	const name = userNameSchema.parse(req.body.name);

	try {
		const newProfile = await prisma.profile.create({
			data: {
				userId,
				name,
			},
		});

		res.success(newProfile, 201);
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === 'P2002') {
				res.error('Profile already exists', 409);
				return;
			}
		}

		throw err;
	}
};
export default asyncHandler(createProfileController);
