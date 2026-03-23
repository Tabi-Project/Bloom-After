import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from "../components/adminNavbar.js";
import { renderSettingsSection } from "../components/adminRenderers.js";
import { adminConfig, settingsData } from "../data/admin.js";
import { renderFooter } from "../components/footer.js";
import api from "../api.js";

const ADMIN_USER_KEY = "adminUser";

const getStoredAdminUser = () => {
  try {
    const s = sessionStorage.getItem(ADMIN_USER_KEY);
    if (!s) return null;
    const p = JSON.parse(s);
    return p && typeof p === "object" ? p : null;
  } catch {
    return null;
  }
};

const fetchPendingCount = async () => {
  try {
    const [storiesRes, ngosRes, suggestionsRes] = await Promise.all([
      api.get("/api/v1/admin/stories"),
      api.get("/api/v1/admin/ngos"),
      api.get("/api/v1/admin/suggestions"),
    ]);

    const stories = Array.isArray(storiesRes?.data?.stories) ? storiesRes.data.stories : [];
    const ngos = Array.isArray(ngosRes?.data?.ngos) ? ngosRes.data.ngos : [];
    const suggestions = Array.isArray(suggestionsRes?.data?.suggestions)
      ? suggestionsRes.data.suggestions
      : [];

    return [...stories, ...ngos, ...suggestions].filter(
      (item) => String(item?.status || "pending").toLowerCase() === "pending",
    ).length;
  } catch (err) {
    if (err?.status === 401 || err?.status === 403) {
      window.location.assign("/admin/login");
      return 0;
    }
    return 0;
  }
};

const fetchSettings = async () => {
  try {
    const response = await api.get('/api/v1/admin/settings');
    return response?.data || settingsData;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      window.location.assign('/admin/login');
      return null;
    }
    return settingsData;
  }
};

const bindLogout = () => {
  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Logging out...";
      try {
        await api.post("/api/v1/auth/logout");
      } catch (_) {
      } finally {
        btn.textContent = orig;
        btn.disabled = false;
        sessionStorage.removeItem(ADMIN_USER_KEY);
        sessionStorage.removeItem("adminToken");
        window.location.assign("/admin/login");
      }
    });
  });
};

const initProfileMenu = () => {
  const toggle = document.getElementById("topbar-profile-btn");
  const menu = document.getElementById("topbar-user-menu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.contains("open") ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (
      menu.classList.contains("open") &&
      !menu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
};

const initSettingsTabs = () => {
  const activeTab = document.getElementById("settings-tab-active");
  const pendingTab = document.getElementById("settings-tab-pending");
  const activePanel = document.getElementById("settings-panel-active");
  const pendingPanel = document.getElementById("settings-panel-pending");

  if (!activeTab || !pendingTab || !activePanel || !pendingPanel) return;

  const showActive = () => {
    activeTab.classList.add("active");
    pendingTab.classList.remove("active");
    activeTab.setAttribute("aria-selected", "true");
    pendingTab.setAttribute("aria-selected", "false");
    activePanel.classList.remove("is-hidden");
    pendingPanel.classList.add("is-hidden");
  };

  const showPending = () => {
    pendingTab.classList.add("active");
    activeTab.classList.remove("active");
    pendingTab.setAttribute("aria-selected", "true");
    activeTab.setAttribute("aria-selected", "false");
    pendingPanel.classList.remove("is-hidden");
    activePanel.classList.add("is-hidden");
  };

  activeTab.addEventListener("click", showActive);
  pendingTab.addEventListener("click", showPending);
};

const normalizeRoleForApi = (roleLabel) => {
  const normalized = String(roleLabel || '').trim().toLowerCase();
  if (normalized.includes('super')) return 'superadmin';
  if (normalized.includes('editor')) return 'editor';
  return 'moderator';
};

const bindInviteForm = async (storedAdminUser) => {
  const form = document.getElementById('settings-invite-form');
  const emailInput = document.getElementById('settings-invite-email');
  const roleInput = document.getElementById('settings-invite-role');
  const statusNode = document.getElementById('settings-invite-status');
  const submitBtn = document.getElementById('settings-send-invite-btn');

  if (!form || !emailInput || !roleInput || !statusNode || !submitBtn) return;

  const setStatus = (message, type = '') => {
    statusNode.textContent = message;
    statusNode.classList.remove('is-error', 'is-success');
    if (type) statusNode.classList.add(type);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');

    const email = emailInput.value.trim().toLowerCase();
    const role = normalizeRoleForApi(roleInput.value);

    if (!email) {
      setStatus('Email is required.', 'is-error');
      emailInput.focus();
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await api.post('/api/v1/admin/settings/invite', { email, role });
      setStatus(response?.message || 'Invite sent successfully.', 'is-success');
      form.reset();

      const liveSettings = await fetchSettings();
      if (!liveSettings) return;
      document.getElementById('settings-root').innerHTML = renderSettingsSection(liveSettings);
      initSettingsTabs();
      bindInviteForm(storedAdminUser);
      bindResendInviteButtons(storedAdminUser);
    } catch (error) {
      const details = error?.data?.details;
      const message = details ? `${error?.message || 'Failed to send invite.'} (${details})` : (error?.message || 'Failed to send invite. Please try again.');
      setStatus(message, 'is-error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
};

const bindResendInviteButtons = async (storedAdminUser) => {
  const buttons = document.querySelectorAll('[data-resend-invite-id]');
  const statusNode = document.getElementById('settings-invite-status');

  if (!buttons.length || !statusNode) return;

  const setStatus = (message, type = '') => {
    statusNode.textContent = message;
    statusNode.classList.remove('is-error', 'is-success');
    if (type) statusNode.classList.add(type);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const inviteId = button.getAttribute('data-resend-invite-id');
      if (!inviteId) return;

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Resending...';
      setStatus('');

      try {
        const response = await api.post(`/api/v1/admin/settings/invite/resend/${encodeURIComponent(inviteId)}`);
        setStatus(response?.message || 'Invitation email resent.', 'is-success');

        const liveSettings = await fetchSettings();
        if (!liveSettings) return;
        document.getElementById('settings-root').innerHTML = renderSettingsSection(liveSettings);
        initSettingsTabs();
        bindInviteForm(storedAdminUser);
        bindResendInviteButtons(storedAdminUser);
      } catch (error) {
        const details = error?.data?.details;
        const message = details
          ? `${error?.message || 'Failed to resend invite.'} (${details})`
          : (error?.message || 'Failed to resend invite.');
        setStatus(message, 'is-error');
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
};

async function init() {
  const storedAdminUser = getStoredAdminUser();

  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage: "settings",
    totalPending: 0,
    currentRole: storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });

  document.getElementById("topbar-root").innerHTML = renderAdminTopbar({
    name: storedAdminUser?.name,
    email: storedAdminUser?.email,
  });

  const liveSettings = await fetchSettings();
  if (!liveSettings) return;
  document.getElementById("settings-root").innerHTML = renderSettingsSection(liveSettings);
  document.getElementById("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
  bindLogout();
  initProfileMenu();
  initSettingsTabs();
  bindInviteForm(storedAdminUser);
  bindResendInviteButtons(storedAdminUser);

  const totalPending = await fetchPendingCount();
  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    activePage: "settings",
    totalPending,
    currentRole: storedAdminUser?.isSuperAdmin ? "superadmin" : "moderator",
  });

  initAdminNavbar();
}

init();
