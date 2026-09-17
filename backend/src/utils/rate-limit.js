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
var rate_limit_exports = {};
__export(rate_limit_exports, {
  consumeRateLimit: () => consumeRateLimit,
  getClientIp: () => getClientIp,
  rateLimitMessage: () => rateLimitMessage
});
module.exports = __toCommonJS(rate_limit_exports);
var import_server_only = require("server-only");
var import_headers = require("next/headers");
var import_db = require("@/lib/db");
async function consumeRateLimit(key, options) {
  const now = Date.now();
  const windowStart = new Date(now - options.windowMs);
  await import_db.db.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } });
  const count = await import_db.db.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } });
  if (count >= options.max) {
    const oldest = await import_db.db.rateLimitAttempt.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true }
    });
    const retryAfterMs = oldest ? oldest.createdAt.getTime() + options.windowMs - now : options.windowMs;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }
  await import_db.db.rateLimitAttempt.create({ data: { key } });
  return { allowed: true };
}
async function getClientIp() {
  const headersList = await (0, import_headers.headers)();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
function rateLimitMessage(retryAfterMs) {
  const minutes = Math.max(1, Math.ceil(retryAfterMs / 6e4));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  consumeRateLimit,
  getClientIp,
  rateLimitMessage
});
