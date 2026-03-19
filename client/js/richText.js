const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'EM',
  'UL',
  'OL',
  'LI',
  'H2',
  'H3',
  'BLOCKQUOTE',
  'A',
]);

const SAFE_URL_PATTERN = /^(https?:|mailto:|tel:)/i;

function cleanNode(node) {
  const childNodes = Array.from(node.childNodes);

  childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      return;
    }

    const tagName = child.tagName.toUpperCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = document.createDocumentFragment();
      while (child.firstChild) {
        fragment.appendChild(child.firstChild);
      }
      child.replaceWith(fragment);
      cleanNode(node);
      return;
    }

    const attributes = Array.from(child.attributes);
    attributes.forEach((attribute) => {
      const attrName = attribute.name.toLowerCase();
      if (tagName === 'A' && attrName === 'href') return;
      child.removeAttribute(attribute.name);
    });

    if (tagName === 'A') {
      const href = child.getAttribute('href') || '';
      if (!SAFE_URL_PATTERN.test(href)) {
        child.replaceWith(document.createTextNode(child.textContent || ''));
      } else {
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer nofollow');
      }
    }

    cleanNode(child);
  });
}

export function sanitizeRichTextHtml(value) {
  if (typeof value !== 'string' || !value.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML.trim();
}

export function richTextToPlainText(value) {
  const sanitized = sanitizeRichTextHtml(value);
  if (!sanitized) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function toRichTextHtml(value) {
  if (typeof value !== 'string' || !value.trim()) return '';

  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return sanitizeRichTextHtml(value);
  }

  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return sanitizeRichTextHtml(paragraphs || `<p>${escaped}</p>`);
}
