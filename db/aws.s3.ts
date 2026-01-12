import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!
        });
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!
            },
            region: process.env.NEXT_PUBLIC_AWS_S3_REGION!
        });
        
        const fileKey = "/uploads" + Date.now().toString() + file.name.replace(" ", "-");

        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
            Key: fileKey,
            Body: file
        }

        const upload = s3.putObject(params).on("httpUploadProgress", evt => {
            const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
            console.log("Uploading to S3", percent.toString());
        }).promise();

        await upload.then((data) => {
            console.log(`Successfully uploaded to S3!`, data);
        });

        return Promise.resolve({
            file_key: fileKey,
            file_name: file.name
        })
    } catch (error) {
        console.error("Something went wrong!", error);
    }
}

export async function getS3Url(file_key: string) {
    const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION!}.amazonaws.com/${file_key}`;

    return url;
}