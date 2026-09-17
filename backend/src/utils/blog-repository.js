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
var blog_repository_exports = {};
__export(blog_repository_exports, {
  getAllPublishedCategories: () => getAllPublishedCategories,
  getBlogPostRedirect: () => getBlogPostRedirect,
  getFeaturedPosts: () => getFeaturedPosts,
  getPostsByCategory: () => getPostsByCategory,
  getPublishedPostBySlug: () => getPublishedPostBySlug,
  getPublishedPostSlugs: () => getPublishedPostSlugs,
  getPublishedPosts: () => getPublishedPosts,
  getRelatedPosts: () => getRelatedPosts
});
module.exports = __toCommonJS(blog_repository_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
function toPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    imageAlt: row.imageAlt,
    author: row.author,
    category: row.category,
    featured: row.featured,
    readTime: row.readTime,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    keywords: row.keywords,
    relatedCategories: row.relatedCategories,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().split("T")[0] : null,
    updatedAt: row.updatedAt.toISOString().split("T")[0]
  };
}
async function getPublishedPosts() {
  const rows = await import_db.db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" }
  });
  return rows.map(toPost);
}
async function getPublishedPostBySlug(slug) {
  const row = await import_db.db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" }
  });
  return row ? toPost(row) : null;
}
async function getBlogPostRedirect(oldSlug) {
  const redirect = await import_db.db.blogPostRedirect.findUnique({
    where: { oldSlug },
    include: { post: { select: { slug: true, status: true } } }
  });
  if (!redirect || redirect.post.status !== "PUBLISHED") return null;
  return redirect.post.slug;
}
async function getFeaturedPosts() {
  const rows = await import_db.db.blogPost.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" }
  });
  return rows.map(toPost);
}
async function getPostsByCategory(category) {
  const rows = await import_db.db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      category: { equals: category, mode: "insensitive" }
    },
    orderBy: { publishedAt: "desc" }
  });
  return rows.map(toPost);
}
async function getAllPublishedCategories() {
  const rows = await import_db.db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"]
  });
  return rows.map((r) => r.category);
}
async function getRelatedPosts(slug, limit = 3) {
  const current = await import_db.db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, category: true }
  });
  if (!current) return [];
  const sameCat = await import_db.db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: current.id },
      category: current.category
    },
    orderBy: { publishedAt: "desc" },
    take: limit
  });
  const results = sameCat.map(toPost);
  if (results.length >= limit) return results;
  const seenIds = [current.id, ...sameCat.map((p) => p.id)];
  const others = await import_db.db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: seenIds }
    },
    orderBy: { publishedAt: "desc" },
    take: limit - results.length
  });
  return [...results, ...others.map(toPost)];
}
async function getPublishedPostSlugs() {
  return import_db.db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAllPublishedCategories,
  getBlogPostRedirect,
  getFeaturedPosts,
  getPostsByCategory,
  getPublishedPostBySlug,
  getPublishedPostSlugs,
  getPublishedPosts,
  getRelatedPosts
});
