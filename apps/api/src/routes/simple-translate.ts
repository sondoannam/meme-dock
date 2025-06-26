import { Router } from 'express';
import { translationController } from '../controllers/simple-translate';

const router: Router = Router();

/**
 * @route POST /api/simple-translate
 * @description Translate text from one language to another
 * @access Public
 */
router.post('/', translationController.translate);

/**
 * @route GET /api/simple-translate/languages
 * @description Get a list of supported languages
 * @access Public
 */
router.get('/languages', translationController.getSupportedLanguages);

export default router;
