import bcryptjs from 'bcryptjs';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import initTokens from '@utils/initTokens';

const prisma = new PrismaClient();

export const registerController = async (req: Request, res: Response) => {
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
