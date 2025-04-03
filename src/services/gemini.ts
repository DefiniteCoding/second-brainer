
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GeminiService = {
  saveApiKey: (apiKey: string): void => {
    localStorage.setItem('gemini_api_key', apiKey);
  },

  getApiKey: (): string | null => {
    return localStorage.getItem('gemini_api_key');
  },

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
      await model.generateContent("test");
      return true;
    } catch (error) {
      console.error("API key validation error:", error);
      return false;
    }
  },

  removeApiKey: (): void => {
    localStorage.removeItem('gemini_api_key');
  }
};
