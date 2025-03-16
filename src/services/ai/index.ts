import { 
  generateSummary, 
  extractKeywords, 
  findRelatedNotes, 
  naturalLanguageSearch,
  setApiKey,
  hasApiKey 
} from '@/services/ai';

export { setApiKey, getApiKey, hasApiKey } from '../api/geminiApi';
export { generateSummary } from './summaryService';
export { extractKeywords } from './keywordService';
export { findRelatedNotes } from './relationService';
export { naturalLanguageSearch } from './searchService'; 