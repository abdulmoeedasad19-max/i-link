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
var send_exports = {};
__export(send_exports, {
  sendEmail: () => sendEmail
});
module.exports = __toCommonJS(send_exports);
var import_server_only = require("server-only");
var import_client = require("./client");
async function sendEmail(payload) {
  const client = (0, import_client.getEmailClient)();
  if (!client) {
    return;
  }
  try {
    const result = await client.emails.send({
      from: import_client.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });
    if (result.error) {
      console.error(`[email] Resend rejected "${payload.subject}" to a customer:`, result.error.message);
    }
  } catch (err) {
    console.error(`[email] Failed to send "${payload.subject}":`, err instanceof Error ? err.message : err);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendEmail
});
