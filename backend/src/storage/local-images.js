var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var local_images_exports = {};
__export(local_images_exports, {
  deleteProductImageLocal: () => deleteProductImageLocal,
  uploadProductImage: () => uploadProductImage
});
module.exports = __toCommonJS(local_images_exports);
var import_server_only = require("server-only");
var import_promises = require("node:fs/promises");
var import_node_path = __toESM(require("node:path"));
var import_node_crypto = require("node:crypto");
const UPLOAD_SUBDIR = (process.env.UPLOAD_DIR || "uploads").replace(/^\/+|\/+$/g, "");
const PRODUCTS_DIR = import_node_path.default.join(process.cwd(), "public", UPLOAD_SUBDIR, "products");
const URL_PREFIX = `/${UPLOAD_SUBDIR}/products/`;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_DETECTED_TYPE = {
  jpeg: "jpg",
  png: "png",
  webp: "webp"
};
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return "jpeg";
  }
  if (buffer.length >= 8 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return "png";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  return null;
}
async function uploadProductImage(file) {
  if (file.size === 0) {
    return { error: "This file is empty." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    return { error: "Only JPG, PNG, and WebP images are allowed." };
  }
  const extension = EXTENSION_BY_DETECTED_TYPE[detectedType];
  const safeLabel = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const filename = `${safeLabel || "image"}-${(0, import_node_crypto.randomUUID)()}.${extension}`;
  try {
    await (0, import_promises.mkdir)(PRODUCTS_DIR, { recursive: true });
    await (0, import_promises.writeFile)(import_node_path.default.join(PRODUCTS_DIR, filename), buffer);
  } catch (err) {
    console.error("[storage/local-images] write failed:", err);
    return { error: "Unable to save this image. Please try again." };
  }
  return { url: `${URL_PREFIX}${filename}` };
}
async function deleteProductImageLocal(url) {
  if (!url.startsWith(URL_PREFIX)) return;
  const filename = url.slice(URL_PREFIX.length);
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return;
  }
  try {
    await (0, import_promises.unlink)(import_node_path.default.join(PRODUCTS_DIR, filename));
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("[storage/local-images] delete failed:", err);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteProductImageLocal,
  uploadProductImage
});
