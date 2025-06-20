import dotenv from 'dotenv';
import ImageKit from 'imagekit';
import { ConfigError } from '../utils/errors';

// Load environment variables
dotenv.config();

const {
  IMAGEKIT_PUBLIC_API_KEY,
  IMAGEKIT_PRIVATE_API_KEY,
  IMAGEKIT_URL_ENDPOINT
} = process.env;

let imagekit: ImageKit | null = null;

/**
 * Get the ImageKit instance
 * @returns ImageKit SDK instance
 */
export function getImageKit(): ImageKit {
  if (!imagekit) {
    // Validate required configuration
    if (!IMAGEKIT_PUBLIC_API_KEY || !IMAGEKIT_PRIVATE_API_KEY || !IMAGEKIT_URL_ENDPOINT) {
      throw new ConfigError(
        'Missing required ImageKit environment variables: IMAGEKIT_PUBLIC_API_KEY, IMAGEKIT_PRIVATE_API_KEY, IMAGEKIT_URL_ENDPOINT'
      );
    }

    // Initialize ImageKit client
    imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_API_KEY,
      privateKey: IMAGEKIT_PRIVATE_API_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });
  }

  return imagekit;
}

export const IMAGEKIT_CONFIG = {
  isConfigured: Boolean(IMAGEKIT_PUBLIC_API_KEY && IMAGEKIT_PRIVATE_API_KEY && IMAGEKIT_URL_ENDPOINT),
  publicKey: IMAGEKIT_PUBLIC_API_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT
};
