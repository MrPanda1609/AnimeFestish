// === AnimeFetish — Main Entry Point ===
import './index.css';
import { addRoute, initRouter } from './js/router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderHomePage } from './pages/home.js';
import { renderDetailPage } from './pages/detail.js';
import { renderWatchPage } from './pages/watch.js';
import { renderSearchPage } from './pages/search.js';
import { renderAnimePage } from './pages/anime.js';

// Initialize components
renderNavbar();
renderFooter();

// Register routes
addRoute('/', renderHomePage);
addRoute('/anime', () => renderAnimePage({ category: 'anime' }));
addRoute('/anime/:slug', renderDetailPage);
addRoute('/watch/:slug/:ep', renderWatchPage);
addRoute('/search', () => renderSearchPage({ keyword: '' }));
addRoute('/search/:keyword', renderSearchPage);
addRoute('/category/:category', (params) => renderAnimePage(params));

// Start router
initRouter();

// Intro animation — show for at least 2s then fade out
const INTRO_MIN_MS = 2000;
const introStart = performance.now();

window.addEventListener('load', () => {
  const elapsed = performance.now() - introStart;
  const remaining = Math.max(0, INTRO_MIN_MS - elapsed);

  setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 600);
    }
  }, remaining);
});
