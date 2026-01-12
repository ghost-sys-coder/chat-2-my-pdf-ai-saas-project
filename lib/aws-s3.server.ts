import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const s3ClientConfig = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!
    }
});

export const uploadPDFToS3 = async (file: File) => {
    const fileExtension = file.name.split(".").pop();
    const uniqueKey = `/uploads/${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3ClientConfig.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type
    }));


    return {
        file_key: uniqueKey,
        file_name: file.name,
        file_url: `https://${process.env.AWS_S3_BUCKET_NAME!}.s3.${process.env.AWS_S3_REGION!}.amazonaws.com/${uniqueKey}`
    }
}