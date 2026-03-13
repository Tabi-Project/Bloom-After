import {
  renderAdminSidebar,
  renderAdminTopbar,
  initAdminNavbar,
} from "../components/adminNavbar.js";
import {
  renderOverviewSection,
  renderQueuesAndContent,
  renderRolesSection,
} from "../components/adminRenderers.js";
import {
  adminConfig,
  statsData,
  queuesData,
  draftData,
  rolesData,
} from "../data/admin.js";
import { renderFooter } from "../components/footer.js";

async function init() {
  const totalPending = queuesData.reduce((sum, q) => sum + q.count, 0);

  document.getElementById("sidebar-root").innerHTML = renderAdminSidebar({
    ...adminConfig,
    totalPending,
  });
  document.getElementById("topbar-root").innerHTML = renderAdminTopbar();
  document.getElementById("overview-root").innerHTML =
    renderOverviewSection(statsData);
  document.getElementById("queues-content-root").innerHTML =
    renderQueuesAndContent(queuesData, draftData);
  document.getElementById("roles-root").innerHTML =
    renderRolesSection(rolesData);
  document.getElementById("footer-root").innerHTML = renderFooter();

  initAdminNavbar();
}

init();
