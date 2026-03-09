// === Navbar Component ===
import { navigate } from '../js/router.js';
import { getProfiles, getCurrentProfile, setCurrentProfile, addProfile } from '../js/watchHistory.js';

let mobileOpen = false;
let searchOpen = false;

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  const currentProfile = getCurrentProfile();

  navbar.innerHTML = `
    <div class="navbar" id="nav">
      <div class="navbar-inner">
        <div class="navbar-logo" id="nav-logo">
          <img src="/Gemini_Generated_Image_l00nrdl00nrdl00n-removebg-preview.png" alt="Logo" class="navbar-logo-img" />
          <span class="navbar-logo-text">AnimeFetish</span>
        </div>
        <div class="navbar-links" id="nav-links">
          <div class="mobile-search-bar">
            <svg class="mobile-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" class="mobile-search-input" id="mobile-search-input" placeholder="Tìm anime..." />
          </div>
          <a href="#/" class="nav-link" data-route="/">Trang chủ</a>
          <a href="#/anime" class="nav-link" data-route="/anime">Anime</a>
          <a href="#/category/hanh-dong" class="nav-link" data-route="/category/hanh-dong">Hành Động</a>
          <a href="#/category/tinh-cam" class="nav-link" data-route="/category/tinh-cam">Tình Cảm</a>
          <a href="#/category/vien-tuong" class="nav-link" data-route="/category/vien-tuong">Viễn Tưởng</a>
        </div>
        <div class="navbar-search" id="nav-search">
          <button class="navbar-search-btn" id="search-toggle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
          <input type="text" placeholder="Tìm anime..." id="search-input" />
        </div>
        <div class="profile-selector" id="profile-selector">
          <div class="profile-avatar">${currentProfile.charAt(0).toUpperCase()}</div>
          <span>${currentProfile}</span>
          <div class="profile-dropdown" id="profile-dropdown"></div>
        </div>
        <button class="navbar-mobile-btn" id="mobile-toggle">☰</button>
      </div>
    </div>
    <div class="bottom-nav" id="bottom-nav">
      <button class="bottom-nav-item" data-route="/" id="bnav-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Trang chủ</span>
      </button>
      <button class="bottom-nav-item" data-route="/anime" id="bnav-anime">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        <span>Anime</span>
      </button>
      <button class="bottom-nav-item" data-route="/search" id="bnav-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Tìm kiếm</span>
      </button>
      <button class="bottom-nav-item" data-route="/profile" id="bnav-profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Hồ sơ</span>
      </button>
    </div>
    <div class="mobile-backdrop" id="mobile-backdrop"></div>
  `;

  // Logo click
  document.getElementById('nav-logo').addEventListener('click', () => navigate('/'));

  // Search toggle
  const searchContainer = document.getElementById('nav-search');
  const searchInput = document.getElementById('search-input');
  document.getElementById('search-toggle').addEventListener('click', () => {
    searchOpen = !searchOpen;
    searchContainer.classList.toggle('open', searchOpen);
    if (searchOpen) searchInput.focus();
  });

  // Search submit
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput.value.trim())}`);
      searchInput.value = '';
      searchOpen = false;
      searchContainer.classList.remove('open');
    }
  });

  // Mobile menu
  document.getElementById('mobile-toggle').addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    const links = document.getElementById('nav-links');
    links.classList.toggle('mobile-open', mobileOpen);
    document.getElementById('mobile-backdrop').classList.toggle('active', mobileOpen);
    document.getElementById('mobile-toggle').textContent = mobileOpen ? '✕' : '☰';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close mobile menu when clicking outside (on the overlay itself)
  document.getElementById('nav-links').addEventListener('click', (e) => {
    if (e.target === document.getElementById('nav-links')) {
      closeMobileMenu();
    }
  });

  function closeMobileMenu() {
    mobileOpen = false;
    document.getElementById('nav-links').classList.remove('mobile-open');
    document.getElementById('mobile-backdrop').classList.remove('active');
    document.getElementById('mobile-toggle').textContent = '☰';
  }

  // Profile selector
  const profileSelector = document.getElementById('profile-selector');
  const profileDropdown = document.getElementById('profile-dropdown');

  profileSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.toggle('open');
    if (isOpen) {
      renderProfileDropdown();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    profileDropdown.classList.remove('open');
  });

  function renderProfileDropdown() {
    const profiles = getProfiles();
    const current = getCurrentProfile();
    
    profileDropdown.innerHTML = `
      ${profiles.map(p => `
        <button class="profile-item ${p === current ? 'active' : ''}" data-profile="${p}">
          <div class="profile-avatar">${p.charAt(0).toUpperCase()}</div>
          ${p}
        </button>
      `).join('')}
      <div style="border-top:1px solid var(--border-color);margin:4px 0;"></div>
      <input class="profile-add-input" id="new-profile-input" placeholder="+ Thêm người xem..." />
    `;

    // Profile switch
    profileDropdown.querySelectorAll('.profile-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.profile;
        setCurrentProfile(name);
        profileDropdown.classList.remove('open');
        // Update UI
        profileSelector.querySelector('.profile-avatar').textContent = name.charAt(0).toUpperCase();
        const spanEl = profileSelector.querySelector('span');
        if (spanEl) spanEl.textContent = name;
        // Re-render current page to reflect new profile history
        navigate(window.location.hash.slice(1) || '/');
      });
    });

    // Add new profile
    const input = profileDropdown.querySelector('#new-profile-input');
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const name = input.value.trim();
        addProfile(name);
        setCurrentProfile(name);
        profileDropdown.classList.remove('open');
        profileSelector.querySelector('.profile-avatar').textContent = name.charAt(0).toUpperCase();
        const spanEl = profileSelector.querySelector('span');
        if (spanEl) spanEl.textContent = name;
        navigate(window.location.hash.slice(1) || '/');
      }
    });
  }

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }
  });

  // Active link
  updateActiveLink();
  window.addEventListener('hashchange', updateActiveLink);

  // Bottom navigation
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      if (route === '/profile') {
        const profileDropdown = document.getElementById('profile-dropdown');
        profileDropdown.classList.toggle('open');
        if (profileDropdown.classList.contains('open')) {
          renderProfileDropdown();
        }
      } else {
        navigate(route === '/search' ? '/search/' : route);
      }
    });
  });

  // Mobile backdrop — close menu on click
  document.getElementById('mobile-backdrop').addEventListener('click', () => {
    closeMobileMenu();
  });

  // Mobile search input
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && mobileSearchInput.value.trim()) {
        navigate(`/search/${encodeURIComponent(mobileSearchInput.value.trim())}`);
        mobileSearchInput.value = '';
        closeMobileMenu();
      }
    });
  }
}

function updateActiveLink() {
  const hash = window.location.hash.slice(1) || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const route = link.getAttribute('data-route');
    link.classList.toggle('active', hash === route || (route !== '/' && hash.startsWith(route)));
  });
  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    const route = item.dataset.route;
    if (route === '/search') {
      item.classList.toggle('active', hash.startsWith('/search'));
    } else if (route === '/') {
      item.classList.toggle('active', hash === '/');
    } else {
      item.classList.toggle('active', hash === route || hash.startsWith(route));
    }
  });
}
