import { convertToModelMessages, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const runTime = "edge";


export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json();
    console.log("Received messages:", messages);
    try {

        const result = await streamText({
            model: openai("gpt-4o-mini"),
            messages: await convertToModelMessages(messages),
            // system: "You are a helpful assistant that answers questions about the uploaded PDF document. Provide concise and accurate responses based on the content of the document.",
            system: "You are an assistannt that responds to questions from the user",
            temperature: 0.2,
            maxOutputTokens: 1500
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error in OpenAI chat route:", error);
        return new Response(JSON.stringify({
            success: false,
            message: (error as Error).message || "Something went wrong"
        }), { status: 500 });;
    }
}