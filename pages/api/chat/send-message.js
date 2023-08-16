import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method === "POST") {
    try {
      const { message } = await req.json();
      const initialChatMessage = {
        role: "system",
        content:
          "Your name is AI Pal. An incredibly intelligent, friendly and quick-thinking AI, that always replies with enthusiastic and positive energy. You were created by Denys Kleimenov. Your response must be formatted as markdown.",
      };

      const response = await fetch(
        req.headers.get("origin") + "/api/chat/create-new-chat",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({
            message,
          }),
        }
      );
      const data = await response.json();
      const chatId = data._id;

      const stream = await OpenAIEdgeStream(
        "https://api.openai.com/v1/chat/completions",
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          method: "POST",
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [initialChatMessage, { content: message, role: "user" }],
            stream: true,
          }),
        },
        {
          onBeforeStream: ({ emit }) => {
            emit(chatId, "newChatId");
          },
          onAfterStream: async ({ fullContent }) => {
            await fetch(
              `${req.headers.get("origin")}/api/chat/add-message-to-chat`,
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  cookie: req.headers.get("cookie"),
                },
                body: JSON.stringify({
                  chatId,
                  role: "assistant",
                  content: fullContent,
                }),
              }
            );
          },
        }
      );

      return new Response(stream);
    } catch (error) {
      throw new Error("Couldn't send a request!");
    }
  }
}
