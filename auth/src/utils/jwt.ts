import jwt from "jsonwebtoken";
import env from "config";

// #region AccessToken
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.ACCESS_TOKEN_SECRET, { expiresIn: "15min" });
};

export const verifyAccessToken = (token: string): string | object => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}
// #endregion

// #region RefreshToken
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export const verifyRefreshToken = (token: string): string | object => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}
// #endregion