// Shared HTML transform used by both index.html (paste/replace in edit mode)
// and manager.html (create landing from pasted HTML), so both flows produce
// identical output for #editable-area.
(function (global) {
  function findMatchingBrace(css, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}") {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function scopeCssSelector(selector, scopeSelector) {
    const trimmed = selector.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith(scopeSelector)) return trimmed;
    if (trimmed === "*") return scopeSelector + " *";
    if (/^(html|body|:root)(\b|(?=[.#:\[]|$))/i.test(trimmed)) {
      return trimmed.replace(/^(html|body|:root)/i, scopeSelector);
    }
    return scopeSelector + " " + trimmed;
  }

  function splitCssSelectors(selectorText) {
    const selectors = [];
    let current = "";
    let depth = 0;
    for (const ch of selectorText) {
      if (ch === "(" || ch === "[") depth += 1;
      if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      if (ch === "," && depth === 0) {
        selectors.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) selectors.push(current);
    return selectors;
  }

  function scopeCss(css, scopeSelector) {
    let source = String(css || "").replace(/\/\*[\s\S]*?\*\//g, "");
    let output = "";
    let i = 0;

    while (i < source.length) {
      const nextOpen = source.indexOf("{", i);
      if (nextOpen === -1) {
        output += source.slice(i);
        break;
      }

      const head = source.slice(i, nextOpen).trim();
      const close = findMatchingBrace(source, nextOpen);
      if (close === -1) break;
      const body = source.slice(nextOpen + 1, close);

      if (!head) {
        i = close + 1;
        continue;
      }

      if (/^@media/i.test(head) || /^@supports/i.test(head)) {
        output += `${head}{${scopeCss(body, scopeSelector)}}`;
      } else if (/^@(keyframes|font-face|import|charset|property)/i.test(head)) {
        output += `${head}{${body}}`;
      } else if (head.startsWith("@")) {
        output += `${head}{${body}}`;
      } else {
        const scopedSelectors = splitCssSelectors(head)
          .map((selector) => scopeCssSelector(selector, scopeSelector))
          .filter(Boolean)
          .join(", ");
        if (scopedSelectors) output += `${scopedSelectors}{${body}}`;
      }
      i = close + 1;
    }

    return output;
  }

  function removePublicAdminPanels(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll([
      "#admin-panel",
      "#admin-login",
      "#admin-dash",
      "#admin-table",
      "[id^='admin-']",
      "[class*='admin' i]",
      "[data-admin]"
    ].join(",")).forEach((el) => el.remove());

    root.querySelectorAll("section, div, table").forEach((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/Danh sách (khách|đăng ký)|Xuất CSV|Mã PIN|PIN chỉ dùng|admin/i.test(text)) {
        const hasLeadTable = /Thời gian.*Họ tên.*(SĐT|Số điện thoại)/i.test(text);
        if (hasLeadTable || /Xuất CSV|Mã PIN|PIN chỉ dùng|admin/i.test(text)) el.remove();
      }
    });
  }

  function removeInlineHandlers(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes || []).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || "").trim().toLowerCase();
        if (name.startsWith("on")) el.removeAttribute(attr.name);
        if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
          el.setAttribute(attr.name, "#");
        }
      });
    });
  }

  function extractDefaultLogoSrc(rawHtml) {
    const match = String(rawHtml || "").match(/const\s+DEFAULT_LOGO\s*=\s*(['"])(data:image\/[^'"]+)\1/);
    return match?.[2] || "";
  }

  function materializeTemplateLogos(root, rawHtml = "") {
    if (!root?.querySelectorAll) return;
    const defaultLogo = extractDefaultLogoSrc(rawHtml);
    const template = root.querySelector("template#logo-svg");
    root.querySelectorAll(".logo-slot").forEach((slot) => {
      if (slot.children.length || slot.textContent.trim()) return;
      if (defaultLogo) {
        const img = document.createElement("img");
        img.className = "logo";
        img.src = defaultLogo;
        img.alt = "StockTraders";
        slot.appendChild(img);
        slot.closest(".brand")?.classList.add("has-custom");
        return;
      }
      const logo = template?.content?.firstElementChild?.cloneNode(true);
      if (logo) slot.appendChild(logo);
    });
  }

  function cssDefinesSelectorProperty(css, selectorToken, property) {
    const source = String(css || "").replace(/\/\*[\s\S]*?\*\//g, "");
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const propRe = new RegExp(`(^|[;\\s])${escaped}\\s*:`, "i");
    let i = 0;
    while (i < source.length) {
      const open = source.indexOf("{", i);
      if (open === -1) return false;
      const close = findMatchingBrace(source, open);
      if (close === -1) return false;
      const head = source.slice(i, open);
      const body = source.slice(open + 1, close);
      if (!head.trim().startsWith("@") && head.includes(selectorToken) && propRe.test(body)) return true;
      i = close + 1;
    }
    return false;
  }

  function inheritedHeroReset(css, scopeSelector) {
    const resetProps = {
      "min-height": "auto",
      "display": "block",
      "flex-direction": "initial",
      "align-items": "initial",
      "justify-content": "initial",
      "text-align": "initial",
      "overflow": "visible"
    };
    const rules = Object.entries(resetProps)
      .filter(([property]) => !cssDefinesSelectorProperty(css, ".hero", property))
      .map(([property, value]) => `${property}:${value}!important;`);
    return rules.length ? `${scopeSelector} .hero{${rules.join("")}}` : "";
  }

  function extractHtmlForEditableArea(rawHtml, mode = "append") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const hasDocumentShell = /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(rawHtml);
    const styles = [];
    let container;

    if (hasDocumentShell) {
      doc.querySelectorAll("style").forEach((style) => styles.push(style.textContent || ""));
      container = doc.body || doc.documentElement;
    } else {
      container = document.createElement("div");
      container.innerHTML = rawHtml;
      container.querySelectorAll("style").forEach((style) => {
        styles.push(style.textContent || "");
        style.remove();
      });
    }

    materializeTemplateLogos(container, rawHtml);
    container.querySelectorAll("script, meta, title, base").forEach((el) => el.remove());
    removePublicAdminPanels(container);
    removeInlineHandlers(container);
    const bodyHtml = container.innerHTML.trim();

    if (mode === "replace") {
      const scopeSelector = "#editable-area";
      const sourceCss = styles.join("\n");
      const scopedCss = sourceCss ? scopeCss(sourceCss, scopeSelector) : "";
      const layoutGuard = `${scopeSelector}{width:100%!important;max-width:none!important;margin:0!important;} ${scopeSelector} .reveal{opacity:1!important;transform:none!important;} ${scopeSelector} > nav{max-width:none!important;} ${scopeSelector} img, ${scopeSelector} video, ${scopeSelector} canvas, ${scopeSelector} svg{max-width:100%;}${inheritedHeroReset(sourceCss, scopeSelector)}`;
      const scopedStyle = scopedCss ? `<style>${scopedCss}${layoutGuard}</style>` : `<style>${layoutGuard}</style>`;
      return `${scopedStyle}${bodyHtml}`;
    }

    const scopeClass = "pasted-ui-" + Date.now().toString(36);
    const scopeSelector = "." + scopeClass + " .pasted-document";
    const scopedCss = styles.length ? scopeCss(styles.join("\n"), scopeSelector) : "";
    const layoutGuard = `${scopeSelector}{min-height:auto!important;width:100%!important;max-width:none!important;} ${scopeSelector} .reveal{opacity:1!important;transform:none!important;} ${scopeSelector} img, ${scopeSelector} video, ${scopeSelector} canvas, ${scopeSelector} svg{max-width:100%;} ${scopeSelector} > nav, ${scopeSelector} > header{display:none!important;} ${scopeSelector} > *:first-child{margin-top:0!important;padding-top:32px!important;}`;
    const scopedStyle = `<style>${scopedCss}${layoutGuard}</style>`;
    return `<section class="custom-pasted-section ${scopeClass}">${scopedStyle}<div class="pasted-document">${bodyHtml}</div></section>`;
  }

  global.LandingHtmlTransform = {
    findMatchingBrace,
    scopeCssSelector,
    splitCssSelectors,
    scopeCss,
    removePublicAdminPanels,
    removeInlineHandlers,
    extractDefaultLogoSrc,
    materializeTemplateLogos,
    cssDefinesSelectorProperty,
    inheritedHeroReset,
    extractHtmlForEditableArea,
  };
})(window);
