import { translate } from '@vitalets/google-translate-api';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('TranslateService');

/**
 * Translation service utilizing Google Translate API for simple word/phrase translations
 */
export interface TranslationRequest {
  text: string;
  from?: string;
  to: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
}

/**
 * Translates text from one language to another
 * @param {TranslationRequest} request - Object containing text to translate and language options
 * @returns {Promise<TranslationResponse>} Translation result with original and translated text
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const { text, from = 'auto', to } = request;
    
    logger.debug('Starting translation', { textLength: text?.length, from, to });
    
    // Validate inputs
    if (!text) {
      throw new Error('Text to translate is required');
    }
    
    if (!to) {
      throw new Error('Target language is required');
    }
    
    // Perform translation
    const result = await translate(text, { from, to });
    
    logger.debug('Translation completed successfully', { 
      fromLanguage: result.raw.src || from,
      toLanguage: to,
      originalLength: text.length,
      translatedLength: result.text.length
    });
    
    return {
      originalText: text,
      translatedText: result.text,
      fromLanguage: result.raw.src || from,
      toLanguage: to
    };
  } catch (error: unknown) {
    // Add context to error
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'TooManyRequestsError') {
      logger.warn('Translation API rate limit exceeded', { 
        textLength: request.text?.length,
        from: request.from,
        to: request.to
      });
      throw new Error('Translation API rate limit exceeded. Please try again later.');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Translation failed', { 
      error,
      textLength: request.text?.length,
      from: request.from,
      to: request.to
    });
    throw new Error(`Translation failed: ${errorMessage}`);
  }
}

/**
 * List of supported languages by the translation service
 * This is a static list of commonly used languages
 */
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];
