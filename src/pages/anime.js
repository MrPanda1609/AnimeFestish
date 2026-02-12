// === Anime List / Category Page ===
import { fetchAnimeList, fetchByCategory, fetchByCountry } from '../js/api.js';
import { filterAnimeOnly } from '../js/animeFilter.js';
import { createAnimeCard, createSkeletonCard } from '../components/animeCard.js';

const CATEGORY_TITLES = {
  'anime': 'Phim Hoạt Hình',
  'hanh-dong': 'Thể Loại: Hành Động',
  'tinh-cam': 'Thể Loại: Tình Cảm',
  'vien-tuong': 'Thể Loại: Viễn Tưởng',
  'phieu-luu': 'Thể Loại: Phiêu Lưu',
  'hai-huoc': 'Thể Loại: Hài Hước',
  'bi-an': 'Thể Loại: Bí Ẩn',
  'khoa-hoc': 'Thể Loại: Khoa Học',
  'chinh-kich': 'Thể Loại: Chính Kịch',
  'nhat-ban': 'Anime Nhật Bản',
  'trung-quoc': 'Anime Trung Quốc',
  'au-my': 'Anime Âu Mỹ',
  'han-quoc': 'Anime Hàn Quốc',
};

const COUNTRY_SLUGS = ['nhat-ban', 'trung-quoc', 'au-my', 'han-quoc'];

export async function renderAnimePage({ category }) {
  const main = document.getElementById('main-content');
  const slug = category || 'anime';
  const title = CATEGORY_TITLES[slug] || slug;
  const isCountry = COUNTRY_SLUGS.includes(slug);

  main.innerHTML = `
    <div class="category-header">
      <h1 class="category-title">${title}</h1>
      <div class="category-filters">
        <a href="#/anime" class="filter-chip ${slug === 'anime' ? 'active' : ''}">Tất cả</a>
        <a href="#/category/nhat-ban" class="filter-chip ${slug === 'nhat-ban' ? 'active' : ''}">🇯🇵 Nhật Bản</a>
        <a href="#/category/trung-quoc" class="filter-chip ${slug === 'trung-quoc' ? 'active' : ''}">🇨🇳 Trung Quốc</a>
        <a href="#/category/hanh-dong" class="filter-chip ${slug === 'hanh-dong' ? 'active' : ''}">⚔️ Hành Động</a>
        <a href="#/category/vien-tuong" class="filter-chip ${slug === 'vien-tuong' ? 'active' : ''}">🌌 Viễn Tưởng</a>
        <a href="#/category/tinh-cam" class="filter-chip ${slug === 'tinh-cam' ? 'active' : ''}">💕 Tình Cảm</a>
        <a href="#/category/hai-huoc" class="filter-chip ${slug === 'hai-huoc' ? 'active' : ''}">😂 Hài Hước</a>
      </div>
    </div>
    <div class="section" style="padding-top:0">
      <div id="anime-grid" class="anime-grid"></div>
      <div id="anime-pagination" class="pagination"></div>
    </div>
  `;

  await loadPage(slug, isCountry, 1);
}

async function loadPage(slug, isCountry, page) {
  const grid = document.getElementById('anime-grid');
  const pagination = document.getElementById('anime-pagination');
  const TARGET_COUNT = 24;

  // Show skeletons
  grid.innerHTML = '';
  for (let i = 0; i < TARGET_COUNT; i++) {
    grid.appendChild(createSkeletonCard());
  }

  try {
    let items = [];
    let totalPages = 1;
    let rawFetchedCount = 0;
    let apiTotalItems = 0;
    let apiTotalPages = 1;
    let reachedEnd = false;

    // Unified page-filling logic for ALL page types
    let fetchPage = page;
    let maxAttempts = 5; // Fetch up to 5 API pages to guarantee 24 items

    while (items.length < TARGET_COUNT && maxAttempts > 0) {
      let data;
      let rawItems = [];

      if (slug === 'anime') {
        // Anime endpoint
        data = await fetchAnimeList(fetchPage);
        rawItems = data.items || [];
        rawFetchedCount += data.rawCount || rawItems.length;
        items = items.concat(rawItems);
        
        const pag = data.params?.pagination || {};
        apiTotalItems = pag.totalItems || apiTotalItems;
        apiTotalPages = pag.totalPages || apiTotalPages;
      } else {
        // Category/country endpoints
        if (isCountry) {
          data = await fetchByCountry(slug, fetchPage);
        } else {
          data = await fetchByCategory(slug, fetchPage);
        }

        rawItems = data.items || [];
        const pag = data.params?.pagination || {};
        apiTotalItems = pag.totalItems || apiTotalItems;
        apiTotalPages = pag.totalPages || apiTotalPages;

        if (rawItems.length === 0) {
          reachedEnd = true;
          break;
        }

        rawFetchedCount += rawItems.length;
        const filtered = filterAnimeOnly(rawItems);
        items = items.concat(filtered);
      }

      if (rawItems.length === 0) {
        reachedEnd = true;
        break;
      }

      fetchPage++;
      maxAttempts--;
      if (fetchPage > apiTotalPages) {
        reachedEnd = true;
        break;
      }
    }

    // Trim to TARGET_COUNT
    items = items.slice(0, TARGET_COUNT);

    // Calculate accurate totalPages based on dedup/filter ratio
    if (rawFetchedCount > 0 && items.length > 0) {
      const uniqueRatio = items.length / rawFetchedCount;
      const estimatedUniqueTotal = Math.ceil(apiTotalItems * uniqueRatio);
      totalPages = Math.ceil(estimatedUniqueTotal / TARGET_COUNT);
      
      // Safety: totalPages should be at least current page
      totalPages = Math.max(totalPages, page);
    } else if (items.length === 0) {
      // No items found — we've gone past the end
      totalPages = Math.max(1, page - 1);
    } else {
      totalPages = page;
    }

    // If we reached API end with incomplete page, cap totalPages
    if (reachedEnd && items.length < TARGET_COUNT) {
      totalPages = page;
    }

    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">😔</div>
          <div class="empty-state-text">Không có anime nào trong mục này</div>
        </div>
      `;
      // Show pagination to go back
      if (page > 1 && totalPages > 1) {
        renderPagination(pagination, page, totalPages, (p) => {
          loadPage(slug, isCountry, p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        pagination.innerHTML = '';
      }
      return;
    }

    items.forEach(item => {
      grid.appendChild(createAnimeCard(item));
    });

    // Pagination
    if (totalPages > 1) {
      renderPagination(pagination, page, totalPages, (p) => {
        loadPage(slug, isCountry, p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      pagination.innerHTML = '';
    }

  } catch (err) {
    console.error('Category page error:', err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Lỗi tải dữ liệu: ${err.message}</div>
      </div>
    `;
  }
}

function renderPagination(container, current, total, onChange) {
  container.innerHTML = '';

  const maxVisible = 7;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '‹';
  prevBtn.disabled = current === 1;
  prevBtn.addEventListener('click', () => onChange(current - 1));
  container.appendChild(prevBtn);

  if (start > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.className = 'page-btn';
    firstBtn.textContent = '1';
    firstBtn.addEventListener('click', () => onChange(1));
    container.appendChild(firstBtn);
    if (start > 2) {
      const dots = document.createElement('span');
      dots.style.cssText = 'color:var(--text-muted);padding:0 4px';
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }

  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === current ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => onChange(i));
    container.appendChild(btn);
  }

  if (end < total) {
    if (end < total - 1) {
      const dots = document.createElement('span');
      dots.style.cssText = 'color:var(--text-muted);padding:0 4px';
      dots.textContent = '...';
      container.appendChild(dots);
    }
    const lastBtn = document.createElement('button');
    lastBtn.className = 'page-btn';
    lastBtn.textContent = total;
    lastBtn.addEventListener('click', () => onChange(total));
    container.appendChild(lastBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '›';
  nextBtn.disabled = current === total;
  nextBtn.addEventListener('click', () => onChange(current + 1));
  container.appendChild(nextBtn);
}
