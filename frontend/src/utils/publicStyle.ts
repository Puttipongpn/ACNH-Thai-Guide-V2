import type { Category } from '../types/api';
import { publicPalette } from '../theme/appTheme';

export const publicShellBackground = `linear-gradient(180deg, ${publicPalette.cream} 0%, ${publicPalette.leafPale} 56%, ${publicPalette.skyPale} 100%)`;

export const softBorder = '1px solid rgba(104, 116, 104, 0.14)';
export const softShadow = '0 8px 20px rgba(83, 111, 87, 0.15)';
export const cardShadow = '0 16px 34px rgba(83, 111, 87, 0.13)';

export const categoryToneColors = [
  publicPalette.leafPale,
  '#e5f3ea',
  publicPalette.skyPale,
  publicPalette.peachPale,
  publicPalette.butterPale,
  publicPalette.rosePale,
];

const categoryIconBySlug: Record<string, string> = {
  'rules-and-important-info': '📌',
  'beginner-guide': '🏝️',
  'tips-and-tricks': '🌿',
  'news-and-updates': '📰',
  'item-info': '🎁',
  villagers: '🏡',
  'fish-bugs-diving': '🐟',
  'island-design': '🌷',
  faq: '❔',
};

export function getCategoryIcon(category?: Pick<Category, 'slug' | 'name'> | null) {
  if (!category) return '📚';
  return categoryIconBySlug[category.slug] ?? '📚';
}

export function getCategoryTone(category?: Pick<Category, 'display_order' | 'slug'> | null) {
  if (!category) return publicPalette.leafPale;
  const index = Math.max((category.display_order || 1) - 1, 0);
  return categoryToneColors[index % categoryToneColors.length];
}

export function getPostImageInfo(metadata: { image_url?: string }[]) {
  const imageUrls = metadata
    .map((item) => resolveUploadUrl(item.image_url))
    .filter((url): url is string => Boolean(url));

  return {
    coverImage: imageUrls[0] ?? '',
    imageCount: imageUrls.length,
  };
}

export function resolveUploadUrl(url?: string) {
  if (!url) return '';
  if (!url.startsWith('/uploads/')) return url;

  const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
  return new URL(url, apiBaseURL.replace(/\/api\/v1\/?$/, '')).toString();
}
