
import { getApiKey, setApiKey as saveEncryptedApiKey, hasApiKey, removeApiKey } from '@/services/ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GeminiService = {
  saveApiKey: async (apiKey: string): Promise<void> => {
    await saveEncryptedApiKey(apiKey);
  },

  getApiKey: async (): Promise<string | null> => {
    return await getApiKey();
  },

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Use the correct model name
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.generateContent("test");
      return true;
    } catch (error) {
      console.error("API key validation error:", error);
      return false;
    }
  },

  hasApiKey: (): boolean => {
    return hasApiKey();
  },

  removeApiKey: (): void => {
    removeApiKey();
  }
};
