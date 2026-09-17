var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var layout_exports = {};
__export(layout_exports, {
  absoluteUrl: () => absoluteUrl,
  emailDetailsTable: () => emailDetailsTable,
  emailHeading: () => emailHeading,
  emailLinkParagraph: () => emailLinkParagraph,
  emailParagraph: () => emailParagraph,
  renderEmailHtml: () => renderEmailHtml,
  renderEmailText: () => renderEmailText
});
module.exports = __toCommonJS(layout_exports);
var import_server_only = require("server-only");
var import_site_config = require("@/lib/site-config");
const NAVY = "#0f172a";
const ROYAL = "#1d4ed8";
const SLATE = "#475569";
const LIGHT_GRAY = "#e2e8f0";
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderEmailHtml(options) {
  const { preheader, bodyHtml, button } = options;
  const buttonHtml = button ? `
      <tr>
        <td style="padding: 8px 0 4px;">
          <a href="${escapeHtml(button.url)}"
             style="display:inline-block;background-color:${ROYAL};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">
            ${escapeHtml(button.label)}
          </a>
        </td>
      </tr>` : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(preheader)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${LIGHT_GRAY};font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;font-size:1px;color:${LIGHT_GRAY};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escapeHtml(preheader)}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_GRAY};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${NAVY};padding:20px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:#ffffff;border-radius:8px;padding:6px 10px;">
                      <img src="${escapeHtml(absoluteUrl("/brand/ilink-logo.jpeg"))}" alt="${escapeHtml(import_site_config.siteConfig.name)}" height="28" style="display:block;height:28px;width:auto;border:0;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${bodyHtml}
                  ${buttonHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${LIGHT_GRAY};">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${SLATE};line-height:1.6;">
                  ${escapeHtml(import_site_config.siteConfig.name)} &middot; ${escapeHtml(import_site_config.siteConfig.phone)} &middot;
                  <a href="mailto:${escapeHtml(import_site_config.siteConfig.email)}" style="color:${SLATE};">${escapeHtml(import_site_config.siteConfig.email)}</a>
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${SLATE};">
                  This is a transactional email about your account or order at ${escapeHtml(import_site_config.siteConfig.url.replace(/^https?:\/\//, ""))}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
function emailParagraph(text) {
  return `<tr><td style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${NAVY};">${escapeHtml(text)}</td></tr>`;
}
function emailLinkParagraph(before, url, linkLabel, after = "") {
  return `<tr><td style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${NAVY};">${escapeHtml(before)}<a href="${escapeHtml(url)}" style="color:${ROYAL};font-weight:bold;text-decoration:underline;">${escapeHtml(linkLabel)}</a>${escapeHtml(after)}</td></tr>`;
}
function emailHeading(text) {
  return `<tr><td style="padding:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:${NAVY};">${escapeHtml(text)}</td></tr>`;
}
function emailDetailsTable(rows) {
  const rowsHtml = rows.map(
    (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${LIGHT_GRAY};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${SLATE};">${escapeHtml(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${LIGHT_GRAY};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:${NAVY};text-align:right;">${escapeHtml(r.value)}</td>
      </tr>`
  ).join("");
  return `<tr><td style="padding:8px 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table></td></tr>`;
}
function renderEmailText(options) {
  const lines = [import_site_config.siteConfig.name, "", options.heading, ""];
  for (const p of options.paragraphs) {
    lines.push(p, "");
  }
  if (options.details && options.details.length > 0) {
    for (const d of options.details) {
      lines.push(`${d.label}: ${d.value}`);
    }
    lines.push("");
  }
  if (options.button) {
    lines.push(`${options.button.label}: ${options.button.url}`, "");
  }
  lines.push(`${import_site_config.siteConfig.name} \xB7 ${import_site_config.siteConfig.phone} \xB7 ${import_site_config.siteConfig.email}`);
  return lines.join("\n");
}
function absoluteUrl(path) {
  return `${import_site_config.siteConfig.url}${path}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  absoluteUrl,
  emailDetailsTable,
  emailHeading,
  emailLinkParagraph,
  emailParagraph,
  renderEmailHtml,
  renderEmailText
});
