// === Home Page — Japanese Anime Focused ===
import { fetchAnimeList, fetchJapaneseAnime, fetchByCategory } from '../js/api.js';
import { filterAnimeOnly } from '../js/animeFilter.js';
import { getContinueWatching } from '../js/watchHistory.js';
import { renderHero, stopHero } from '../components/hero.js';
import { renderAnimeRow, renderSkeletonRow } from '../components/animeRow.js';
import { renderContinueWatching } from '../components/continueWatching.js';

export async function renderHomePage() {
  const main = document.getElementById('main-content');
  main.innerHTML = '';

  // Hero container
  const heroContainer = document.createElement('div');
  main.appendChild(heroContainer);

  // Continue watching container
  const continueContainer = document.createElement('div');
  main.appendChild(continueContainer);

  // Content container
  const content = document.createElement('div');
  main.appendChild(content);

  // Show skeletons
  renderSkeletonRow(content, 'Anime Nhật Bản Mới Nhất');
  renderSkeletonRow(content, 'Hành Động Nhật Bản');

  try {
    // Fetch Japanese anime first (main focus) + general list + extra pages for variety
    const [japanData, japanPage2, animeData, chinaData] = await Promise.all([
      fetchJapaneseAnime(1),
      fetchJapaneseAnime(2),
      fetchAnimeList(1),
      fetchAnimeList(2),
    ]);

    // Filter EVERYTHING through anime filter first to exclude dramas/live-action
    const japanRaw = filterAnimeOnly([...(japanData.items || []), ...(japanPage2.items || [])]);
    const allAnime = filterAnimeOnly([...(animeData.items || []), ...(chinaData.items || [])]);

    // Japanese anime only (verified anime + from Japan)
    const japanAnime = japanRaw.filter(i =>
      i.country?.some(c => c.slug === 'nhat-ban')
    );

    // Hero: only show confirmed anime, Japanese priority
    const heroPool = japanAnime.length >= 5
      ? japanAnime
      : [...japanAnime, ...allAnime.filter(i => !japanAnime.some(j => j.slug === i.slug))];
    renderHero(heroContainer, heroPool.slice(0, 5));

    // Continue Watching
    const continueItems = getContinueWatching(10);
    if (continueItems.length > 0) {
      renderContinueWatching(continueContainer, continueItems);
    }

    // Clear skeletons and render actual rows
    content.innerHTML = '';

    // 1. Japanese anime — Main section (biggest)
    const japanOnly = japanAnime.slice(0, 24);
    if (japanOnly.length > 0) {
      renderAnimeRow(content, 'Anime Nhật Bản Mới Nhất 🇯🇵', japanOnly, '#/category/nhat-ban');
    }

    // 2. All new anime (mixed)
    const newAnime = allAnime.filter(i => !japanOnly.some(j => j.slug === i.slug)).slice(0, 20);
    if (newAnime.length > 0) {
      renderAnimeRow(content, 'Mới Cập Nhật 🔥', newAnime, '#/anime');
    }

    // 3. Fetch Japanese-focused genres
    try {
      const [actionData, romanceData, fantasyData] = await Promise.all([
        fetchByCategory('hanh-dong', 1),
        fetchByCategory('tinh-cam', 1),
        fetchByCategory('vien-tuong', 1),
      ]);

      // Filter to anime and prioritize Japanese
      const filterJP = (items) => {
        const anime = filterAnimeOnly(items || []);
        const jp = anime.filter(i => i.country?.some(c => c.slug === 'nhat-ban'));
        const others = anime.filter(i => !jp.some(j => j.slug === i.slug));
        return [...jp, ...others].slice(0, 20);
      };

      const actionItems = filterJP(actionData.items);
      const romanceItems = filterJP(romanceData.items);
      const fantasyItems = filterJP(fantasyData.items);

      if (actionItems.length > 0) {
        renderAnimeRow(content, 'Hành Động ⚔️', actionItems, '#/category/hanh-dong');
      }
      if (romanceItems.length > 0) {
        renderAnimeRow(content, 'Tình Cảm 💕', romanceItems, '#/category/tinh-cam');
      }
      if (fantasyItems.length > 0) {
        renderAnimeRow(content, 'Viễn Tưởng 🌌', fantasyItems, '#/category/vien-tuong');
      }
    } catch (e) {
      console.warn('Failed to load genre rows:', e);
    }

    // 4. Chinese anime as secondary section
    const chinaItems = allAnime
      .filter(i => i.country?.some(c => c.slug === 'trung-quoc'))
      .filter(i => !japanOnly.some(j => j.slug === i.slug))
      .slice(0, 14);
    if (chinaItems.length > 0) {
      renderAnimeRow(content, 'Anime Trung Quốc 🇨🇳', chinaItems, '#/category/trung-quoc');
    }

  } catch (err) {
    console.error('Home page error:', err);
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>
      </div>
    `;
  }

  return () => {
    stopHero();
  };
}
