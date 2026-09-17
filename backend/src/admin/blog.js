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
var blog_exports = {};
__export(blog_exports, {
  getAdminBlogPostById: () => getAdminBlogPostById,
  getAdminBlogPosts: () => getAdminBlogPosts
});
module.exports = __toCommonJS(blog_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
async function getAdminBlogPosts() {
  return import_db.db.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      featured: true,
      publishedAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: "desc" }
  });
}
async function getAdminBlogPostById(id) {
  return import_db.db.blogPost.findUnique({
    where: { id }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAdminBlogPostById,
  getAdminBlogPosts
});
