import env from '@/config';
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const bucketClient = new S3Client({
	endpoint: env.S3_ENDPOINT,
	region: env.S3_REGION,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS,
	},
	forcePathStyle: true, // Required for MinIO compatibility (turn off for AWS S3)
});

export const getObjectUrl = (ObjectKey: string): string => {
	return `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/${ObjectKey}`;
};

/**
 * Get all objects in the S3 bucket (Testing purposes)
 * @param limit - total amount
 * @param startAfter - the key to start after
 * @returns array of urls
 */
export const getAllObjects = async (limit = 1000, startAfter?: string): Promise<string[]> => {
	const command = new ListObjectsV2Command({
		Bucket: env.S3_BUCKET_NAME,
		MaxKeys: limit,
		StartAfter: startAfter,
	});

	const response = await bucketClient.send(command);

	return response.Contents?.map((item) => getObjectUrl(item.Key || '')) || [];
};

export const uploadObject = async (ObjectKey: string, body: Buffer | string): Promise<string> => {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: ObjectKey,
		Body: body,
	});

	await bucketClient.send(command);

	return getObjectUrl(ObjectKey);
};

export const deleteObject = async (ObjectKey: string): Promise<void> => {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: ObjectKey,
	});

	await bucketClient.send(command);
};
