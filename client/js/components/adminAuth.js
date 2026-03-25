import api from '../api.js';

const ADMIN_USER_KEY = 'adminUser';
const ADMIN_AUTH_VERIFIED_KEY = 'adminAuthVerified';
const ADMIN_TOKEN_KEY = 'adminToken';

const getPathname = (inputUrl = '') => {
  try {
    return new URL(inputUrl).pathname || '';
  } catch {
    return '';
  }
};

const isAdminPath = (pathname = window.location.pathname) => pathname.startsWith('/admin');

const isAdminAuthFreePath = (pathname = window.location.pathname) =>
  pathname === '/admin/login' || pathname.startsWith('/admin/accept-invite');

const getStoredAdminUser = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const clearAdminSessionStorage = () => {
  sessionStorage.removeItem(ADMIN_USER_KEY);
  sessionStorage.removeItem(ADMIN_AUTH_VERIFIED_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

const ensureLoader = () => {
  let loader = document.getElementById('admin-auth-loader');
  if (loader) return loader;

  loader = document.createElement('div');
  loader.id = 'admin-auth-loader';
  loader.className = 'admin-auth-loader';
  loader.innerHTML = `
    <div class="admin-auth-loader-box" role="status" aria-live="polite" aria-label="Checking admin access">
      <span class="admin-auth-loader-spinner" aria-hidden="true"></span>
      <p>Checking admin access…</p>
    </div>
  `;

  document.body.appendChild(loader);
  return loader;
};

const showLoader = () => {
  const loader = ensureLoader();
  loader.classList.add('visible');
};

const hideLoader = () => {
  const loader = document.getElementById('admin-auth-loader');
  if (!loader) return;
  loader.classList.remove('visible');
};

const redirectToAdminLogin = () => {
  window.location.assign('/admin/login');
};

const hasFreshAdminReferrer = () => {
  const refPath = getPathname(document.referrer);
  return Boolean(refPath) && isAdminPath(refPath) && !isAdminAuthFreePath(refPath);
};

const shouldSkipAuthCheck = () => {
  if (sessionStorage.getItem(ADMIN_AUTH_VERIFIED_KEY) !== '1') return false;
  return Boolean(getStoredAdminUser());
};

const ensureAdminAccess = async () => {
  if (!isAdminPath() || isAdminAuthFreePath()) return null;

  if (!hasFreshAdminReferrer()) {
    sessionStorage.removeItem(ADMIN_AUTH_VERIFIED_KEY);
  }

  if (shouldSkipAuthCheck()) {
    return getStoredAdminUser();
  }

  showLoader();

  try {
    const response = await api.get('/api/v1/auth/session');
    const user = response?.user || response?.data?.user || null;

    if (!user) {
      throw new Error('Missing authenticated user');
    }

    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(ADMIN_AUTH_VERIFIED_KEY, '1');
    return user;
  } catch (_) {
    clearAdminSessionStorage();
    redirectToAdminLogin();
    return null;
  } finally {
    hideLoader();
  }
};

await ensureAdminAccess();

export {
  ADMIN_AUTH_VERIFIED_KEY,
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  clearAdminSessionStorage,
  getStoredAdminUser,
};
