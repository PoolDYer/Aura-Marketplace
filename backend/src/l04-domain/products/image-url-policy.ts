export const BLOCKED_PRODUCT_IMAGE_URLS = [
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/placeholder.png',
];

const blockedProductImageUrls = new Set(BLOCKED_PRODUCT_IMAGE_URLS);

export function isPersistableProductImageUrl(url: string) {
  return url.length > 0 && !blockedProductImageUrls.has(url);
}
