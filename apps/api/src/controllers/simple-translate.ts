import { Request, Response, NextFunction } from 'express';
import { translateText, supportedLanguages } from '../services/simple-translate.service';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('TranslateController');

/**
 * Controller for handling translation requests
 */
export const translationController = {
  /**
   * Translates text from one language to another
   */
  async translate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('Translation request received', {
        ip: req.ip,
        body: req.body,
      });

      const { text, from, to } = req.body;

      // Validation
      if (!text || typeof text !== 'string') {
        logger.debug('Invalid request - missing or invalid text', { text });
        res.status(400).json({
          success: false,
          message: 'Text is required and must be a string',
        });
        return;
      }

      if (text.length > 1000) {
        logger.debug('Invalid request - text too long', { textLength: text.length });
        res.status(400).json({
          success: false,
          message: 'Text is too long, maximum 1000 characters',
        });
        return;
      }

      if (!to || typeof to !== 'string' || to.length < 2) {
        logger.debug('Invalid request - missing or invalid target language', { to });
        res.status(400).json({
          success: false,
          message: 'Target language code is required',
        });
        return;
      }

      // Check if 'from' is valid if provided
      if (from !== undefined && (typeof from !== 'string' || from.length < 2)) {
        logger.debug('Invalid request - invalid source language', { from });
        res.status(400).json({
          success: false,
          message: 'Source language code must be at least 2 characters',
        });
        return;
      }

      // Perform translation
      const result = await translateText({
        text,
        from,
        to,
      });

      logger.info('Translation successful', {
        fromLanguage: result.fromLanguage,
        toLanguage: result.toLanguage,
        textLength: text.length,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Translation error', { error });
      res.status(500).json({
        message: `Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined,
      });
    }
  },

  /**
   * Returns a list of supported languages
   */
  getSupportedLanguages(req: Request, res: Response): void {
    logger.debug('Supported languages requested', { ip: req.ip });

    res.status(200).json(supportedLanguages);
  },
};
