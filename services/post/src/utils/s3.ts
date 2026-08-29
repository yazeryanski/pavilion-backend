import path from 'node:path';
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

import env from '@/config';

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
  // The client above uses the internal endpoint; URLs returned to callers must use the
  // externally reachable one when the two differ (see S3_PUBLIC_ENDPOINT in config).
  const publicEndpoint = env.S3_PUBLIC_ENDPOINT || env.S3_ENDPOINT;

  return `${publicEndpoint}/${env.S3_BUCKET_NAME}/${ObjectKey}`;
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

  try {
    const response = await bucketClient.send(command);
    return response.Contents?.map((item) => getObjectUrl(item.Key || '')) || [];
  } catch (error) {
    console.error('Error fetching S3 objects:', error);
    throw error;
  }
};

export const uploadObject = async (file: Express.Multer.File): Promise<string> => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuid()}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
  });

  try {
    await bucketClient.send(command);
  } catch (error: unknown) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }

  return getObjectUrl(fileName);
};

export const deleteObject = async (ObjectKey: string): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: ObjectKey,
  });

  try {
    await bucketClient.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};
