import OpenAI from "openai";

export const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});


export async function getEmbeddingsFromOpenAI(text: string) {
    try {
        const embeddingResponse = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: text.replace(/\n/g, " "),
            encoding_format: "float"
        });
        return embeddingResponse.data[0].embedding as number[];
    } catch (error) {
        console.error("Error getting embeddings from OpenAI: ", (error as Error).message);
        throw error;
    }
}