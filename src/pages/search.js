// === Search Page ===
import { searchAnime } from '../js/api.js';
import { filterAnimeOnly } from '../js/animeFilter.js';
import { createAnimeCard, createSkeletonCard } from '../components/animeCard.js';

let searchTimeout = null;

export async function renderSearchPage({ keyword }) {
  const main = document.getElementById('main-content');
  const decodedKeyword = keyword ? decodeURIComponent(keyword) : '';

  main.innerHTML = `
    <div class="search-page">
      <div class="search-bar-lg">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input-lg" placeholder="Tìm anime bạn muốn xem..." value="${decodedKeyword}" autofocus />
      </div>
      <div id="search-results-info" class="search-results-info"></div>
      <div id="search-results" class="anime-grid"></div>
      <div id="search-pagination" class="pagination"></div>
    </div>
  `;

  const input = document.getElementById('search-input-lg');
  const resultsContainer = document.getElementById('search-results');
  const resultsInfo = document.getElementById('search-results-info');
  const paginationContainer = document.getElementById('search-pagination');

  // Search function
  async function doSearch(query, page = 1) {
    if (!query.trim()) {
      resultsContainer.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Nhập từ khóa để tìm anime</div>
        </div>
      `;
      resultsInfo.textContent = '';
      paginationContainer.innerHTML = '';
      return;
    }

    // Show loading skeletons
    resultsContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      resultsContainer.appendChild(createSkeletonCard());
    }
    resultsInfo.textContent = 'Đang tìm kiếm...';

    try {
      const data = await searchAnime(query, page);
      const rawItems = data.items || [];
      const items = filterAnimeOnly(rawItems);
      const pagination = data.params?.pagination || {};

      resultsContainer.innerHTML = '';

      if (items.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-state-icon">😔</div>
            <div class="empty-state-text">Không tìm thấy kết quả cho "${query}"</div>
          </div>
        `;
        resultsInfo.textContent = '';
        paginationContainer.innerHTML = '';
        return;
      }

      resultsInfo.textContent = `Tìm thấy ${pagination.totalItems || items.length} kết quả cho "${query}"`;

      items.forEach(item => {
        resultsContainer.appendChild(createAnimeCard(item));
      });

      // Pagination
      const totalPages = pagination.totalPages || Math.ceil((pagination.totalItems || items.length) / 24);
      const currentPage = pagination.currentPage || page;

      if (totalPages > 1) {
        renderPagination(paginationContainer, currentPage, totalPages, (p) => {
          doSearch(query, p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        paginationContainer.innerHTML = '';
      }

    } catch (err) {
      console.error('Search error:', err);
      resultsContainer.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Lỗi tìm kiếm: ${err.message}</div>
        </div>
      `;
    }
  }

  // Debounced input
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const q = input.value.trim();
      if (q) {
        window.history.replaceState(null, '', `#/search/${encodeURIComponent(q)}`);
      }
      doSearch(q);
    }, 500);
  });

  // Initial search
  if (decodedKeyword) {
    doSearch(decodedKeyword);
  } else {
    resultsContainer.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Nhập từ khóa để tìm anime</div>
      </div>
    `;
  }

  return () => {
    clearTimeout(searchTimeout);
  };
}

function renderPagination(container, current, total, onChange) {
  container.innerHTML = '';

  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '‹';
  prevBtn.disabled = current === 1;
  prevBtn.addEventListener('click', () => onChange(current - 1));
  container.appendChild(prevBtn);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === current ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => onChange(i));
    container.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '›';
  nextBtn.disabled = current === total;
  nextBtn.addEventListener('click', () => onChange(current + 1));
  container.appendChild(nextBtn);
}
