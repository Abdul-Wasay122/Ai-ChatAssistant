import { useState } from "react";
import axios from "axios";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const useDeepSeekChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    
    // Add user message to chat
    const newMessages: Message[] = [
      ...messages,
      { text: message, sender: "user" },
    ];
    setMessages(newMessages);

    // Small delay for better UX
    await delay(500);

    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "DeepSeek:R1 0528", // or "deepseek-coder" for code-specific tasks
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant."
            },
            ...newMessages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            }))
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            "Authorization": `Bearer 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`, 
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = response.data.choices[0].message.content;
      setMessages([...newMessages, { text: botMessage, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching DeepSeek response:", error);
      setMessages([
        ...newMessages,
        { 
          text: "Sorry, I encountered an error. Please try again later.", 
          sender: "bot" 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};

export default useDeepSeekChatbot;