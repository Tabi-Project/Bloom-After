import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderFooter } from "../components/footer.js";
import { initSuggestDrawer } from "../components/suggest-drawer.js";

document.getElementById("navbar-root").innerHTML =
  renderNavbar("crisis-handling");
initNavbar();
document.getElementById("footer-root").innerHTML = renderFooter();
initSuggestDrawer();
