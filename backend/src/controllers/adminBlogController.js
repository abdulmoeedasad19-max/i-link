const db = require('../config/db');

exports.createBlogPost = async (req, res) => {
  try {
    const data = req.body;

    const slugTaken = await db.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (slugTaken) {
      return res.status(400).json({ error: "A blog post with this slug already exists." });
    }

    const post = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        imageAlt: data.imageAlt,
        author: data.author || "i.Link Systems & Solutions",
        category: data.category,
        readTime: data.readTime || "5 min read",
        featured: data.featured,
        status: data.status || "DRAFT",
        publishedAt: data.status === "PUBLISHED" && data.publishedAt
          ? new Date(data.publishedAt)
          : data.status === "PUBLISHED"
          ? new Date()
          : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        keywords: data.keywords ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        relatedCategories: data.relatedCategories ? data.relatedCategories.split(",").map((k) => k.trim()).filter(Boolean) : [],
      },
    });

    res.json(post);
  } catch (err) {
    res.status(400).json({ error: "Unable to save this blog post." });
  }
};

exports.updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await db.blogPost.findUnique({ where: { id }, select: { slug: true, title: true } });
    if (!existing) {
      return res.status(404).json({ error: "This blog post no longer exists." });
    }

    if (data.slug !== existing.slug) {
      const slugTaken = await db.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugTaken) {
        return res.status(400).json({ error: "A blog post with this slug already exists." });
      }
    }

    await db.$transaction(async (tx) => {
      if (data.slug !== existing.slug) {
        const existingRedirect = await tx.blogPostRedirect.findUnique({ where: { oldSlug: existing.slug } });
        if (!existingRedirect) {
          await tx.blogPostRedirect.create({
            data: { oldSlug: existing.slug, postId: id },
          });
        }
      }

      await tx.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image,
          imageAlt: data.imageAlt,
          author: data.author,
          category: data.category,
          readTime: data.readTime,
          featured: data.featured,
          status: data.status,
          publishedAt: data.status === "PUBLISHED" && data.publishedAt
            ? new Date(data.publishedAt)
            : data.status === "PUBLISHED" && !data.publishedAt
            ? new Date()
            : null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          keywords: data.keywords ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
          relatedCategories: data.relatedCategories ? data.relatedCategories.split(",").map((k) => k.trim()).filter(Boolean) : [],
        },
      });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Unable to update this blog post." });
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await db.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    await db.$transaction(async (tx) => {
      await tx.blogPostRedirect.deleteMany({ where: { postId: id } });
      await tx.blogPost.delete({ where: { id } });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Unable to delete this post." });
  }
};
