import type { NextFunction, Response, Request } from "express";

// Extend Express Response type to include custom methods
declare global {
  namespace Express {
    interface Response {
      success: (data?: any) => Response;
      error: (message: string, statusCode?: number) => Response;
    }
  }
}

const getResponseBody = (success: boolean, data: any) => {
  return { success, data };
}


export default function responseHandler(_req: Request, res: Response, next: NextFunction) {
  res.success = (data = null) => {
    return res.json(getResponseBody(true, data));
  };

  res.error = (message, statusCode = 400) => {
    return res.status(statusCode).json(getResponseBody(false, message));
  };

  next();
}