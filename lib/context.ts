import { getEmbeddingsFromOpenAI } from "./embeddings";
import { pinecone } from "./pinecone";
import { convertToASCII } from "./utils";

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const nameSpace = convertToASCII(fileKey);
    try {
        const queryResult = await index.namespace(nameSpace).query({
            vector: embeddings,
            topK: 5,
            includeMetadata: true,
        });
        return queryResult.matches || [];
    } catch (error) {
        console.error("Error querying Pinecone:", error);
        throw error;
    }
}

export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddingsFromOpenAI(query);

    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter((match) => {
        return match.score && match.score >= 0.75;
    });

    type Metadata = {
        text: string;
        pageNumber: number;
    };

    const docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    return docs.join("\n---\n");
}