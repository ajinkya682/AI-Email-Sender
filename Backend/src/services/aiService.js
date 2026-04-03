import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { tavily } from "@tavily/core";
import dotenv from "dotenv";

dotenv.config();

// ------------------ MODEL ------------------
const getModel = () => {
  if (process.env.MISTRAL_API_KEY) {
    return new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || "mistral-large-latest",
      temperature: 0,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
    });
  }

  throw new Error("No AI API Key found (OpenAI or Gemini)");
};

// ------------------ INTENT ------------------
export const analyzeIntent = async (userInput) => {
  const model = getModel();

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      intent: z.enum(["CHAT", "SEND_EMAIL"]),
      recipientEmail: z.string().nullable(),
      topic: z.string().nullable(),
      subject: z.string().nullable(),
    }),
  );

  const prompt = new PromptTemplate({
    template: `Classify the user input.

Return JSON only.

User Input: {input}

{format_instructions}`,
    inputVariables: ["input"],
    partialVariables: {
      format_instructions: parser.getFormatInstructions(),
    },
  });

  try {
    const chain = prompt.pipe(model).pipe(parser);
    return await chain.invoke({ input: userInput });
  } catch (err) {
    console.error("Intent parsing error:", err);

    // fallback (VERY IMPORTANT)
    return {
      intent: "CHAT",
      recipientEmail: null,
      topic: userInput,
      subject: null,
    };
  }
};

// ------------------ SEARCH ------------------
export const doWebSearch = async (query) => {
  if (!process.env.TAVILY_API_KEY) {
    return "Web search unavailable - no API key.";
  }

  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY }); // ✅ no "new", use tavily()

    const response = await tvly.search(query, {
      searchDepth: "basic",
      maxResults: 3,
    });

    return response.results
      .map((r) => `Source: ${r.url}\nContent: ${r.content}`)
      .join("\n\n");
  } catch (err) {
    console.error("Tavily search error:", err);
    return "Could not perform web search currently.";
  }
};

// ------------------ EMAIL ------------------
export const draftEmail = async (topic, searchContext, recipient) => {
  const model = getModel();

  const safeTopic = topic || "General message";
  const safeRecipient = recipient || "Recipient";

  const prompt = PromptTemplate.fromTemplate(`
Write a professional email.

Topic: {topic}
Context: {context}
Recipient: {recipient}

Return ONLY HTML.
Start with <div style="...">.
Sign as "AI Assistant".
`);

  const response = await prompt.pipe(model).invoke({
    topic: safeTopic,
    context: searchContext || "N/A",
    recipient: safeRecipient,
  });

  let html = typeof response === "string" ? response : response.content;

  return html
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();
};

// ------------------ CHAT ------------------
export const generateChatResponse = async (historyStr) => {
  const model = getModel();

  const prompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant.

Conversation:
{history}

Reply clearly in markdown.
`);

  const response = await prompt.pipe(model).invoke({
    history: historyStr || "",
  });

  return typeof response === "string" ? response : response.content;
};
