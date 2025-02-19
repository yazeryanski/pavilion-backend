import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import initTokens from '@utils/initTokens';

const prisma = new PrismaClient();

export const loginController = async (req: Request, res: Response) => {
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
