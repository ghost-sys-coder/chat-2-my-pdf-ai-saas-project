import fs from "fs";
import { downloadFromS3 } from "@/actions/downloadFile";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { splitPagesWithPinecone } from "@/utils/SplitPagesWithPinecone";
import { getEmbeddingsFromOpenAI } from "./embeddings";
import { Document } from "@pinecone-database/doc-splitter";
import md5 from "md5";
import { convertToASCII } from "./utils";



interface PDFPage {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number };
        text: string;
    }
}

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

// Helper to batch array into smaller arrays
function chunkArray<T>(array: T[], chunkSize: number): T[][]{
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

// load s3 into pinecone
export async function loadS3IntoPinecone(fileKey: string) {
    // 1. obtain the pdf and read from the pdf
    console.log("Downloading file into file system");
    const { fileName, tempFilePath } = await downloadFromS3(fileKey);

    if (!fileName || !tempFilePath) {
        throw new Error("file not found");
    }

    console.log("Downloaded to: ", tempFilePath);
    console.log("Just file name: ", fileName);

    const loader = new PDFLoader(tempFilePath, {
        splitPages: true,
    });

    const pages = (await loader.load()) as PDFPage[];

    // 2. split and segment the pdf content with pinecone
    const documents = await Promise.all(pages.map(splitPagesWithPinecone))

    // 3. vectorize and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocumentsIntoPinecone));


    // 4. upsert or upload the vectors into pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    console.log("Upserting vectors into pinecone...");
    const nameSpace = convertToASCII(fileKey);

    // split the vectors into chunks of 100 - 200 max per upsert
    const batches = chunkArray(vectors, 100);

    for (const [i, batch] of batches.entries()) {
        console.log(`Upserting batch ${i + 1} of ${batches.length}...`);
        await index.namespace(nameSpace).upsert(batch);
    }

    console.log("Upserted all vectors into pinecone.");

    // delete the temp file after loading -- prevent storage bloat / disk space issues
    try {
        await fs.promises.unlink(tempFilePath);
        console.log("Temp file deleted: ", tempFilePath);
    } catch (error) {
        console.error("Failed to delete temp file: ", error);
    }

    console.log(`Loaded ${pages.length} pages from the PDF.`);

    return documents;
}

// embed the documents into pinecone
export async function embedDocumentsIntoPinecone(document: Document) {
    try {
        const embedResponse = await getEmbeddingsFromOpenAI(document.pageContent);
        const hash = md5(document.pageContent);

        return {
            id: hash,
            values: embedResponse,
            metadata: {
                // ...document[0].metadata
                text: document.metadata.text,
                pageNumber: document.metadata.pageNumber
            } as PineconeRecord["metadata"]
        }
    } catch (error) {
        console.error("Failed to embed documents into pinecone: ", (error as Error).message);
        throw error;
    }
}


