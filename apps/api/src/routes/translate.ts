/**
 * Translation API routes
 */
import { Router } from 'express';
import { translationController } from '../controllers/simple-translate';

const router: Router = Router();

/**
 * @route POST /api/translate
 * @desc Translate text from one language to another
 * @access Public
 */
router.post('/', translationController.translate);

/**
 * @route GET /api/translate/languages
 * @desc Get list of supported languages
 * @access Public
 */
router.get('/languages', translationController.getSupportedLanguages);

export default router;
