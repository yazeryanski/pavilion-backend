import type { ExampleResponse } from '@/types/example.types';
import asyncHandler from '@utils/asyncHandler';
import type { Request, Response } from 'express';

const exampleController = async (req: Request, res: Response) => {
	res.success<ExampleResponse>({
		requestor: req.serviceName,
		userId: req.userId,
		requestId: req.requestId,
	});
};

export default asyncHandler(exampleController);
