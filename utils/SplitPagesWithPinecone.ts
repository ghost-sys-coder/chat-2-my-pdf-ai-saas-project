import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";

interface PDFPage {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number };
        text: string;
    }
}

export async function splitPagesWithPinecone(page: PDFPage) {
    let { pageContent } = page;
    const { metadata } = page;
    pageContent = pageContent.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    const textSplitter = new RecursiveCharacterTextSplitter();
    const docs = await textSplitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000) // truncate to 36KB
            }
        })
    ]);

    return docs;
}

// truncate long content
export function truncateStringByBytes(str: string, bytes: number) {
    const encoder = new TextEncoder();
    return new TextDecoder().decode(encoder.encode(str)).slice(0, bytes);
}