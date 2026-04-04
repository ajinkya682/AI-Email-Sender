import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

export const sendWhatsAppTool = new DynamicStructuredTool({
  name: "send_whatsapp_message",
  description: "Use this tool when user asks to send WhatsApp message, text a number, or message on WhatsApp.",
  schema: z.object({
    to: z.string().describe("The phone number to send the message to, including country code (e.g., '1234567890')"),
    message: z.string().describe("The text message content to send")
  }),
  func: async ({ to, message }) => {
    try {
      const result = await sendWhatsAppMessage({ to, message });
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred in WhatsApp tool"
      });
    }
  }
});
