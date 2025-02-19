import { isValidEmail, isValidPassword } from '@utils/validations';
import type { NextFunction, Request, Response } from 'express';

export default function validateCredentials(req: Request, res: Response, next: NextFunction) {
	req.body.email = req.body.email?.trim();
	req.body.password = req.body.password?.trim();

	const { email, password } = req.body;

	if (!email || !password) {
		res.error('Email and password are required', 400);
		return;
	}

	if (!isValidEmail(email)) {
		res.error('Invalid email', 400);
		return;
	}

	if (!isValidPassword(password)) {
		res.error('Invalid password style(length must be 6 or more)', 400);
		return;
	}

	next();
}
