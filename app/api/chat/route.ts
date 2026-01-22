import { convertToModelMessages, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getContext } from "@/lib/context";

type ChatMetadata = {
  chatId?: number;
};

export const runTime = "edge";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const chatId = [...messages]
    .reverse()
    .find(
      (msg): msg is UIMessage & { metadata: ChatMetadata } =>
        typeof msg.metadata === "object" &&
        msg.metadata !== null &&
        "chatId" in msg.metadata
    )?.metadata.chatId;

  if (!chatId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ChatId missing!",
      }),
      { status: 400 }
    );
  }

  //   query the chat history from your database using the chatId
  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, chatId))
    .limit(1);

  if (!chat?.fileKey) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Chat or file not found",
      }),
      { status: 404 }
    );
  }

  // retrieve file key
  const fileKey = chat.fileKey;

  // get the latest user message
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.role !== "user") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Last message is not user",
      }),
      { status: 400 }
    );
  }

  const userQuery =
    lastMessage.role === "user"
      ? lastMessage.parts
          ?.filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ")
      : "";

  if (!userQuery) {
    console.error("User query not found");
    return new Response(
      JSON.stringify({
        success: false,
        message: "User query not found",
      }),
      { status: 400 }
    );
  }

  // save the user message before calling the AI
  await db.insert(messagesTable).values({
    chatId: chatId ?? 0,
    content: userQuery,
    role: "user",
  });

  // Get RAG Context
  const context = await getContext(userQuery, fileKey);

  console.log("context", context);

  try {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: await convertToModelMessages(messages),
      system: `
        You are a document-based question answering assistant with conversational abilities.

        Your job is to:
        1. Answer greetings and casual conversation naturally and politely.
        2. Answer document-related questions using ONLY the provided CONTEXT.
        3. Do NOT use prior knowledge for document questions.

        Rules:
        - If the user's message is a greeting, introduction, thanks, or casual conversation
        (e.g. "hi", "hello", "good morning", "thanks", "how are you"),
        respond naturally and politely.

        - If the user's question is factual or informational:
        - Use ONLY the CONTEXT below.
        - If the answer is not found in the context, say:
            "I could not find the answer in the provided document."

        - Do NOT hallucinate facts.
        - Do NOT mention the context explicitly.
        - Be concise and helpful.

        CONTEXT:
        ${context}
        `,
      temperature: 0.2,
      maxOutputTokens: 1500,
      onFinish: async ({ text }) => {
        // save the ai response after the streaming is done
        await db.insert(messagesTable).values({
          chatId,
          content: text,
          role: "system",
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in OpenAI chat route:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: (error as Error).message || "Something went wrong",
      }),
      { status: 500 }
    );
  }
}
