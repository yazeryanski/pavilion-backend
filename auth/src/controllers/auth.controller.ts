import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "@utils/jwt";
import redis from "connections/redisClient";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const generateTokensAndSaveToRedis = async (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  // Save refresh token to redis
  await redis.set(userId, refreshToken);

  return {
    accessToken,
    refreshToken
  }
}

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  const isPasswordValid = user && await bcryptjs.compare(password, user.password);

  if (!user || !isPasswordValid) {
    res.error('Invalid email or password', 400);
    return;
  }

  const {
    accessToken,
    refreshToken
  } = await generateTokensAndSaveToRedis(user.id);

  res.success({
    accessToken,
    refreshToken,
  });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    res.error('Email already in use', 400);
    return;
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  });

  const {
    accessToken,
    refreshToken
  } = await generateTokensAndSaveToRedis(user.id);

  res.success({
    accessToken,
    refreshToken,
  });
}