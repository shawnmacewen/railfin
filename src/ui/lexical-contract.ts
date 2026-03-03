"use client";

export const MAX_DRAFT_HTML_LENGTH = 150_000;
export const MAX_COMPLIANCE_TEXT_LENGTH = 20_000;

const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote"]);
const ALLOWED_TAGS = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h1", "h2", "h3", "blockquote", "a"]);
const STRIP_TAGS = new Set(["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "link", "meta", "base"]);

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeLineBreaks(input: string): string {
  return input.replace(/\r\n?/g, "\n");
}

export function plainTextToContractHtml(input: string): string {
  const escaped = escapeHtml(normalizeLineBreaks(input));
  const blocks = escaped.split(/\n{2,}/).map((part) => part.replace(/\n/g, "<br />").trim()).filter(Boolean);
  if (!blocks.length) return "<p></p>";
  return blocks.map((block) => `<p>${block}</p>`).join("");
}

function isLikelyHtml(input: string): boolean {
  return /<\s*[a-z!/]/i.test(input);
}

function normalizeComplianceText(input: string): string {
  return normalizeLineBreaks(input)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_COMPLIANCE_TEXT_LENGTH);
}

export function extractComplianceTextFromHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "<p></p>", "text/html");

  doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  doc.body.querySelectorAll("*").forEach((node) => {
    if (BLOCK_TAGS.has(node.tagName.toLowerCase())) {
      node.appendChild(doc.createTextNode("\n"));
    }
  });

  return normalizeComplianceText(doc.body.textContent || "");
}

function sanitizeHtml(raw: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  STRIP_TAGS.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((node) => node.remove());
  });

  const all = Array.from(doc.body.querySelectorAll("*"));
  for (const node of all) {
    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...Array.from(node.childNodes));
      continue;
    }

    const attrs = Array.from(node.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (name.startsWith("on") || name === "style" || name === "class" || name === "id") {
        node.removeAttribute(attr.name);
        continue;
      }

      if (tag !== "a" || (name !== "href" && name !== "target" && name !== "rel")) {
        node.removeAttribute(attr.name);
        continue;
      }

      if (name === "href") {
        const href = value.toLowerCase();
        if (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:") && !href.startsWith("/")) {
          node.removeAttribute("href");
        }
      }
    }

    if (tag === "a") {
      if (node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer nofollow");
      } else {
        node.removeAttribute("target");
      }
    }
  }

  const html = doc.body.innerHTML.trim();
  if (!html) return "<p></p>";
  if (html.length <= MAX_DRAFT_HTML_LENGTH) return html;

  return "<p>" + escapeHtml(extractComplianceTextFromHtml(html).slice(0, MAX_DRAFT_HTML_LENGTH - 7)) + "</p>";
}

export function normalizeIncomingDraftBody(raw: string): { html: string; text: string } {
  const bounded = (raw || "").slice(0, MAX_DRAFT_HTML_LENGTH);
  const html = sanitizeHtml(isLikelyHtml(bounded) ? bounded : plainTextToContractHtml(bounded));
  const text = extractComplianceTextFromHtml(html);
  return { html, text };
}

export function normalizeEditorChange(html: string): { html: string; text: string } {
  const normalizedHtml = sanitizeHtml(html || "<p></p>");
  return { html: normalizedHtml, text: extractComplianceTextFromHtml(normalizedHtml) };
}
