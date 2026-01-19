"use server";
import fs from "fs";
import os from "os"
import path from "path";
import { Readable } from "stream";

import { s3ClientConfig } from "@/lib/aws-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function downloadFromS3(file_key: string) {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: file_key
    });

    const response = await s3ClientConfig.send(command);

    if (!response.Body) {
        throw new Error("No File returned from s3");
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
    }

    const buffer = Buffer.concat(chunks);

    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `pdf-${Date.now()}.pdf`);

    fs.writeFileSync(filePath, buffer);

    return {
        tempFilePath: filePath,
        fileName: path.basename(filePath)
    };
}