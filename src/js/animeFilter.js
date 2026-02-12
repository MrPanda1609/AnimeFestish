// === Anime Filter Utility ===
// Strict anime-only filtering based on OPhim data

const ANIME_TYPES = ['hoathinh'];

// Keywords that indicate anime content
const ANIME_COUNTRY_SLUGS = ['nhat-ban', 'trung-quoc', 'han-quoc', 'au-my'];

/**
 * Check if an item is anime (hoathinh type)
 */
export function isAnime(item) {
  if (!item) return false;
  
  // Primary check: type field
  if (item.type === 'hoathinh') return true;
  
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
 * Filter items to anime with optional loose matching
 * (for country/category pages where type might be 'series')
 */
export function filterAnimeLoose(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    if (!item) return false;
    // Strict type match
    if (item.type === 'hoathinh') return true;
    return false;
  });
}
