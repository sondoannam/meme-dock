import apiClient from '../api/api-client';
import { Language, TranslationParams, TranslationResponse } from '@/types';

/**
 * Translation service for converting text between languages
 * Uses the backend /api/simple-translate endpoint which implements Google Translate
 */
export const translationApi = {
  async translateSimple(params: TranslationParams): Promise<string> {
    const response = await apiClient.post<TranslationResponse>('/simple-translate', params);

    return response.data.translatedText;
  },

  /**
   * Get list of supported languages
   * @returns Array of language objects { code, name }
   */
  async getSupportedLanguages(): Promise<Language[]> {
    const response = await apiClient.get<Language[]>('/simple-translate/languages');

    return response.data;
  },
};
