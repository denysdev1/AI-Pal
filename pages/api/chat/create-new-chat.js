import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { user } = await getSession(req, res);
      const { message } = req.body;
      const newUserMessage = {
        role: "user",
        content: message,
      };

      const client = await clientPromise;
      const db = client.db("AIPal");
      const chat = await db.collection("chats").insertOne({
        userId: user.sub,
        messages: [newUserMessage],
        title: message,
      });

      res.status(201).json({
        _id: chat.insertedId,
        messages: [newUserMessage],
        title: message,
      });
    } catch {
      res.status(500).json({
        message: "Couldn't create a new chat.",
      });
    }
  }
}
