// === Hero Banner Carousel ===
import { getImageUrl } from '../js/api.js';
import { navigate } from '../js/router.js';

let heroInterval = null;
let currentSlide = 0;

function resolveImg(item) {
  const file = item.poster_url || item.thumb_url;
  if (!file) return '';
  if (file.startsWith('http')) return file;
  if (item._imgCdn) return `${item._imgCdn}${file}`;
  return getImageUrl(file);
}

export function renderHero(container, items) {
  if (!items || items.length === 0) return;

  // Pick top 5 items with poster images
  const slides = items.slice(0, 5);

  container.innerHTML = `
    <div class="hero">
      <div class="hero-slides">
        ${slides.map((item, i) => `
          <div class="hero-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img class="hero-slide-bg" src="${resolveImg(item)}" alt="${item.name}" loading="${i === 0 ? 'eager' : 'lazy'}" />
            <div class="hero-gradient"></div>
            <div class="hero-content">
              <div class="hero-badge">
                <span>🔥</span>
                <span>${item.lang || 'Vietsub'}</span>
              </div>
              <h1 class="hero-title">${item.name}</h1>
              <div class="hero-meta">
                ${item.quality ? `<span class="quality">${item.quality}</span>` : ''}
                ${item.year ? `<span class="year">${item.year}</span>` : ''}
                ${item.episode_current ? `<span class="hero-meta-item">${item.episode_current}</span>` : ''}
                ${item.time ? `<span class="hero-meta-item">⏱ ${item.time}</span>` : ''}
              </div>
              ${item.category ? `
                <p class="hero-desc">${item.category.map(c => c.name).join(' • ')}</p>
              ` : ''}
              <div class="hero-actions">
                <button class="btn btn-primary hero-watch-btn" data-slug="${item.slug}">
                  ▶ Xem ngay
                </button>
                <button class="btn btn-outline hero-detail-btn" data-slug="${item.slug}">
                  ℹ Chi tiết
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="hero-dots">
        ${slides.map((_, i) => `
          <div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('')}
      </div>
    </div>
  `;

  // Event listeners
  container.querySelectorAll('.hero-watch-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/anime/${btn.dataset.slug}`));
  });

  container.querySelectorAll('.hero-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/anime/${btn.dataset.slug}`));
  });

  // Dots
  container.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(container, parseInt(dot.dataset.index), slides.length);
    });
  });

  // Auto-rotate
  startAutoRotate(container, slides.length);
}

function goToSlide(container, index, total) {
  currentSlide = index;
  container.querySelectorAll('.hero-slide').forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
  container.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function startAutoRotate(container, total) {
  clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    const next = (currentSlide + 1) % total;
    goToSlide(container, next, total);
  }, 6000);
}

export function stopHero() {
  clearInterval(heroInterval);
  heroInterval = null;
  currentSlide = 0;
}
