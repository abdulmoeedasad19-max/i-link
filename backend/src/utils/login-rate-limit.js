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
var login_rate_limit_exports = {};
__export(login_rate_limit_exports, {
  checkLoginAttemptStatus: () => checkLoginAttemptStatus,
  clearLoginAttempts: () => clearLoginAttempts,
  recordFailedLoginAttempt: () => recordFailedLoginAttempt
});
module.exports = __toCommonJS(login_rate_limit_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1e3;
const FAILURE_DECAY_MS = LOCKOUT_DURATION_MS;
async function checkLoginAttemptStatus(email) {
  const attempt = await import_db.db.loginAttempt.findUnique({ where: { email }, select: { lockedUntil: true } });
  if (!attempt?.lockedUntil) return { locked: false };
  const remainingMs = attempt.lockedUntil.getTime() - Date.now();
  if (remainingMs <= 0) return { locked: false };
  return { locked: true, retryAfterMs: remainingMs };
}
async function recordFailedLoginAttempt(email) {
  const now = /* @__PURE__ */ new Date();
  const existing = await import_db.db.loginAttempt.findUnique({
    where: { email },
    select: { failedCount: true, lastFailedAt: true }
  });
  const isFreshStreak = !existing?.lastFailedAt || now.getTime() - existing.lastFailedAt.getTime() > FAILURE_DECAY_MS;
  const nextFailedCount = isFreshStreak ? 1 : existing.failedCount + 1;
  const lockedUntil = nextFailedCount >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_DURATION_MS) : null;
  await import_db.db.loginAttempt.upsert({
    where: { email },
    create: { email, failedCount: nextFailedCount, lastFailedAt: now, lockedUntil },
    update: { failedCount: nextFailedCount, lastFailedAt: now, lockedUntil }
  });
}
async function clearLoginAttempts(email) {
  await import_db.db.loginAttempt.deleteMany({ where: { email } });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkLoginAttemptStatus,
  clearLoginAttempts,
  recordFailedLoginAttempt
});
