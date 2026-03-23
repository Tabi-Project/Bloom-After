import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage"]);

function cleanUrlFallbackPlugin(rootDir) {
  return {
    name: "clean-url-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        const url = new URL(req.url, "http://localhost");
        const { pathname, search } = url;

        if (
          pathname === "/" ||
          pathname.endsWith("/") ||
          pathname.startsWith("/api") ||
          pathname.includes(".")
        ) {
          return next();
        }

        const candidateDir = resolve(rootDir, `.${pathname}`);
        const candidateIndex = resolve(candidateDir, "index.html");

        if (fs.existsSync(candidateIndex)) {
          req.url = `${pathname}/${search}`;
        }

        next();
      });
    }
  };
}

function getPages(dir) {
  const pages = {};

  function scan(currentPath, base = "") {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = `${currentPath}/${file}`;
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(file) || file.startsWith(".")) return;
        scan(fullPath, `${base}/${file}`);
      } else if (file === "index.html") {
        const name = base === "" ? "main" : base.slice(1);
        pages[name] = resolve(__dirname, fullPath);
      }
    });
  }

  scan(dir);
  return pages;
}

const rootDir = process.cwd();

export default defineConfig({
  appType: "mpa",
  plugins: [cleanUrlFallbackPlugin(rootDir)],
  build: {
    rollupOptions: {
      input: getPages("./")
    }
  },
  server: {
    port: 5173
  }
});