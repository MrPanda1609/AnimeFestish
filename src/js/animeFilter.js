// === Anime Filter Utility ===
// Strict Japanese anime-only filtering

const ANIME_TYPES = ['hoathinh'];

/**
 * Check if an item is anime (hoathinh type)
 */
export function isAnime(item) {
  if (!item) return false;
  if (item.type === 'hoathinh') return true;
  return false;
}

/**
 * Check if an item is Japanese anime
 */
export function isJapaneseAnime(item) {
  if (!isAnime(item)) return false;
  if (item.country?.some(c => c.slug === 'nhat-ban')) return true;
  return false;
}

/**
 * Filter items to only include anime
 */
export function filterAnimeOnly(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(isAnime);
}

/**
 * Filter to Japanese anime only
 */
export function filterJapaneseAnime(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(isJapaneseAnime);
}

/**
 * Filter items to anime with optional loose matching
 */
export function filterAnimeLoose(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    if (!item) return false;
    if (item.type === 'hoathinh') return true;
    return false;
  });
}
