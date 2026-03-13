// === History-based SPA Router ===
import { resetSEO } from './seo.js';

const routes = {};
let currentCleanup = null;

export function addRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  history.pushState({}, '', path);
  handleRouteChange();
}

export function getCurrentRoute() {
  return window.location.pathname || '/';
}

function matchRoute(path) {
  // Try exact match first
  if (routes[path]) return { handler: routes[path], params: {} };

  // Try pattern matching
  for (const [pattern, handler] of Object.entries(routes)) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler, params };
  }

  return null;
}

export async function handleRouteChange() {
  const path = getCurrentRoute();
  const matched = matchRoute(path);

  // Cleanup previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const mainContent = document.getElementById('main-content');

  if (matched) {
    // Scroll to top
    window.scrollTo(0, 0);
    mainContent.classList.add('fade-in');
    currentCleanup = await matched.handler(matched.params);
    // Remove animation class after it plays
    setTimeout(() => mainContent.classList.remove('fade-in'), 500);
  } else {
    resetSEO();
    mainContent.innerHTML = `
      <div class="empty-state" style="padding-top: 120px;">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Không tìm thấy trang này</div>
        <a href="/" class="btn btn-primary" style="margin-top: 16px;">Về trang chủ</a>
      </div>
    `;
  }
}

export function initRouter() {
  window.addEventListener('popstate', handleRouteChange);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || link.target === '_blank') return;
    if (href.startsWith('/api')) return;
    e.preventDefault();
    navigate(href);
  });

  handleRouteChange();
}
