import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
});

export async function putSigned(key: string, body: Buffer, contentType: string) {
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: body, ContentType: contentType }));
// For R2/S3 without presign, expose public URL if bucket is public; otherwise create a presign function
    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
}