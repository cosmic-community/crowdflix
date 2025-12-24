import { createBucketClient } from '@cosmicjs/sdk'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Log configuration on startup (without exposing sensitive keys)
console.log('[COSMIC] Bucket client initialized:', {
  bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  hasReadKey: !!process.env.COSMIC_READ_KEY,
  hasWriteKey: !!process.env.COSMIC_WRITE_KEY,
  aiEnabled: typeof cosmic.ai !== 'undefined',
  hasGenerateVideo: cosmic.ai ? typeof cosmic.ai.generateVideo === 'function' : false,
  aiObject: cosmic.ai ? Object.keys(cosmic.ai) : [],
})

// Test AI availability on startup
if (cosmic.ai && typeof cosmic.ai.generateVideo === 'function') {
  console.log('[COSMIC] AI video generation is available')
} else {
  console.error('[COSMIC] WARNING: AI video generation is NOT available!', {
    hasAI: !!cosmic.ai,
    aiType: typeof cosmic.ai,
    aiKeys: cosmic.ai ? Object.keys(cosmic.ai) : []
  })
}

// Simple error helper for Cosmic SDK
export function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}