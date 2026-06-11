import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';
import initTokens from '@utils/initTokens';
import bcryptjs from 'bcryptjs';
import type { Request, Response } from 'express';

const loginController = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	const user = await prisma.user.findUnique({
		where: { email },
	});

	const isPasswordValid = user && (await bcryptjs.compare(password, user.password));

	if (!user || !isPasswordValid) {
		res.error('Invalid email or password', 400);
		return;
	}

	const { accessToken, refreshToken } = await initTokens(user.id);

	res.success({
		accessToken,
		refreshToken,
	});
};

export default asyncHandler(loginController);
