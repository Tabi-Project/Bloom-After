const ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "EM", "UL", "OL", "LI",
  "H2", "H3", "BLOCKQUOTE", "A",
]);

const SAFE_URL_PATTERN = /^(https?:|mailto:|tel:)/i;

function cleanNode(node: Node): void {
  const childNodes = Array.from(node.childNodes);

  childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) return;

    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.parentNode?.removeChild(child);
      return;
    }

    const el = child as Element;
    const tagName = el.tagName.toUpperCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = document.createDocumentFragment();
      while (el.firstChild) fragment.appendChild(el.firstChild);
      el.replaceWith(fragment);
      cleanNode(node);
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      if (tagName === "A" && attr.name.toLowerCase() === "href") return;
      el.removeAttribute(attr.name);
    });

    if (tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (!SAFE_URL_PATTERN.test(href)) {
        el.replaceWith(document.createTextNode(el.textContent || ""));
      } else {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer nofollow");
      }
    }

    cleanNode(el);
  });
}

export function sanitizeRichTextHtml(value: string): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  cleanNode(doc.body);
  return doc.body.innerHTML.trim();
}

export function richTextToPlainText(value: string): string {
  const sanitized = sanitizeRichTextHtml(value);
  if (!sanitized) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

export function toRichTextHtml(value: string): string {
  if (typeof value !== "string" || !value.trim()) return "";

  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return sanitizeRichTextHtml(value);
  }

  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return sanitizeRichTextHtml(paragraphs || `<p>${escaped}</p>`);
}