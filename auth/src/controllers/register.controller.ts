import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';
import initTokens from '@utils/initTokens';
import bcryptjs from 'bcryptjs';
import type { Request, Response } from 'express';

const registerController = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		res.error('Email already in use', 400);
		return;
	}

	const hashedPassword = await bcryptjs.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
		},
	});

	const { accessToken, refreshToken } = await initTokens(user.id);

	res.success({
		accessToken,
		refreshToken,
	});
};

export default asyncHandler(registerController);
