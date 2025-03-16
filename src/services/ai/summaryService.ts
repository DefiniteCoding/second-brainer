import { AIResponse, SummaryOptions } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const generateSummary = async (
  content: string,
  options: SummaryOptions = { length: 'medium', focus: 'general' }
): Promise<AIResponse> => {
  try {
    const prompt = `
      Summarize the following text ${options.length === 'short' ? 'very briefly' : 
      options.length === 'long' ? 'comprehensively' : 'concisely'}.
      Focus on ${options.focus === 'technical' ? 'technical details' : 
      options.focus === 'creative' ? 'creative aspects' : 'key points'}.
      
      Text to summarize:
      ${content}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.2 });
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summary) {
      return { error: 'No summary generated' };
    }

    return { summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred while generating the summary' };
  }
}; 