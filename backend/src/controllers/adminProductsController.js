const crypto = require('crypto');
const db = require('../config/db');
const { slugify } = require('../utils/admin/products'); // Adjust imports
const { logActivity } = require('../utils/admin/activity-log');
const { uploadProductImage, deleteProductImageLocal } = require('../utils/storage/local-images');

function isPrismaKnownError(err) {
  return typeof err === "object" && err !== null && "code" in err;
}

function mapProductWriteError(err) {
  if (isPrismaKnownError(err)) {
    if (err.code === "P2002") {
      const target = err.meta?.target?.join(",") ?? "";
      if (target.includes("slug")) return "A product with this slug already exists.";
      if (target.includes("sku")) return "A product with this SKU already exists.";
      return "A product with conflicting details already exists.";
    }
    if (err.code === "P2003") {
      return "The selected category or brand no longer exists.";
    }
    if (err.code === "P2025") {
      return "This product no longer exists.";
    }
  }
  console.error("[admin/products] write failed:", err);
  return "Unable to save this product. Please try again.";
}

exports.uploadStagedProductImage = async (req, res) => {
  try {
    const file = req.file; // Assuming multer
    if (!file) {
      return res.status(400).json({ error: "No file selected." });
    }

    const result = await uploadProductImage(file);
    if (result.error) {
       return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    const adminId = req.user?.id || 'admin';
    
    // Very basic validation - assuming zod validation or middleware can be applied
    if (!data.name || !data.categoryId || data.price == null) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const slugCandidate = data.slug ? data.slug.trim() : slugify(data.name);

    const category = await db.category.findUnique({ where: { id: data.categoryId }, select: { slug: true } });
    if (!category) {
      return res.status(400).json({ errors: { categoryId: "The selected category no longer exists." } });
    }
    if (data.brandId) {
      const brand = await db.brand.findUnique({ where: { id: data.brandId }, select: { id: true } });
      if (!brand) return res.status(400).json({ errors: { brandId: "The selected brand no longer exists." } });
    }

    const slugTaken = await db.product.findUnique({ where: { slug: slugCandidate }, select: { id: true } });
    if (slugTaken) {
      return res.status(400).json({ errors: { slug: "A product with this slug already exists." } });
    }
    if (data.sku) {
      const skuTaken = await db.product.findFirst({ where: { sku: data.sku }, select: { id: true } });
      if (skuTaken) return res.status(400).json({ errors: { sku: "A product with this SKU already exists." } });
    }

    await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          slug: slugCandidate,
          description: data.description,
          shortDescription: data.shortDescription ?? null,
          categoryId: data.categoryId,
          brandId: data.brandId ?? null,
          price: Number(data.price).toFixed(2),
          compareAtPrice: data.compareAtPrice != null ? Number(data.compareAtPrice).toFixed(2) : null,
          sku: data.sku ?? null,
          stock: Number(data.stock),
          status: data.status,
          featured: data.featured === true || data.featured === 'on',
          tags: data.tags || [],
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
        },
        select: { id: true },
      });

      if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: data.imageUrls.map((url, index) => ({
            productId: product.id,
            url,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        });
      }

      await logActivity(tx, {
        adminId,
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        description: `Created product ${data.name}`,
      });
    });

    res.json({ success: true });
  } catch (err) {
    const errorMsg = mapProductWriteError(err);
    res.status(500).json({ error: errorMsg });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const adminId = req.user?.id || 'admin';

    if (!id) {
      return res.status(400).json({ errors: { form: "Missing product id." } });
    }

    const existing = await db.product.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        categoryId: true,
        brandId: true,
        price: true,
        compareAtPrice: true,
        sku: true,
        stock: true,
        status: true,
        featured: true,
        tags: true,
        seoTitle: true,
        seoDescription: true,
        category: { select: { slug: true } },
      },
    });
    if (!existing) {
      return res.status(404).json({ errors: { form: "This product no longer exists." } });
    }

    const category = await db.category.findUnique({ where: { id: data.categoryId }, select: { slug: true } });
    if (!category) {
      return res.status(400).json({ errors: { categoryId: "The selected category no longer exists." } });
    }
    if (data.brandId) {
      const brand = await db.brand.findUnique({ where: { id: data.brandId }, select: { id: true } });
      if (!brand) return res.status(400).json({ errors: { brandId: "The selected brand no longer exists." } });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await db.product.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugTaken) return res.status(400).json({ errors: { slug: "A product with this slug already exists." } });
    }
    if (data.sku) {
      const skuTaken = await db.product.findFirst({ where: { sku: data.sku }, select: { id: true } });
      if (skuTaken && skuTaken.id !== id) return res.status(400).json({ errors: { sku: "A product with this SKU already exists." } });
    }

    const changedFields = [];
    if (existing.name !== data.name) changedFields.push("name");
    if (existing.slug !== data.slug) changedFields.push("slug");
    if (existing.description !== data.description) changedFields.push("description");
    if ((existing.shortDescription ?? null) !== (data.shortDescription ?? null)) changedFields.push("shortDescription");
    if (existing.categoryId !== data.categoryId) changedFields.push("categoryId");
    if ((existing.brandId ?? null) !== (data.brandId ?? null)) changedFields.push("brandId");
    if (existing.price.toNumber() !== Number(data.price)) changedFields.push("price");
    if ((existing.compareAtPrice?.toNumber() ?? null) !== (data.compareAtPrice != null ? Number(data.compareAtPrice) : null)) changedFields.push("compareAtPrice");
    if ((existing.sku ?? null) !== (data.sku ?? null)) changedFields.push("sku");
    if (existing.stock !== Number(data.stock)) changedFields.push("stock");
    if (existing.status !== data.status) changedFields.push("status");
    if (existing.featured !== (data.featured === true || data.featured === 'on')) changedFields.push("featured");
    if (JSON.stringify(existing.tags) !== JSON.stringify(data.tags)) changedFields.push("tags");
    if ((existing.seoTitle ?? null) !== (data.seoTitle ?? null)) changedFields.push("seoTitle");
    if ((existing.seoDescription ?? null) !== (data.seoDescription ?? null)) changedFields.push("seoDescription");

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug || existing.slug,
          description: data.description,
          shortDescription: data.shortDescription ?? null,
          categoryId: data.categoryId,
          brandId: data.brandId ?? null,
          price: Number(data.price).toFixed(2),
          compareAtPrice: data.compareAtPrice != null ? Number(data.compareAtPrice).toFixed(2) : null,
          sku: data.sku ?? null,
          stock: Number(data.stock),
          tags: data.tags || [],
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          status: data.status,
          featured: data.featured === true || data.featured === 'on',
        },
      });

      if (data.slug && existing.slug !== data.slug) {
        await tx.productRedirect.deleteMany({
          where: { oldSlug: data.slug },
        });

        await tx.productRedirect.upsert({
          where: { oldSlug: existing.slug },
          create: { oldSlug: existing.slug, productId: id },
          update: { productId: id },
        });
      }

      await logActivity(tx, {
        adminId,
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: id,
        description: `Updated product ${data.name}`,
        metadata: { changedFields },
      });
    });

    res.json({ success: true });
  } catch (err) {
    const errorMsg = mapProductWriteError(err);
    res.status(500).json({ error: errorMsg });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 'admin';

    const product = await db.product.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        category: { select: { slug: true } },
        images: { select: { url: true } },
      },
    });
    if (!product) {
      return res.status(404).json({ error: "This product no longer exists." });
    }

    const [cartCount, wishlistCount] = await Promise.all([
      db.cartItem.count({ where: { productId: id } }),
      db.wishlistItem.count({ where: { productId: id } }),
    ]);
    if (cartCount > 0 || wishlistCount > 0) {
      return res.status(400).json({
        error: "This product can't be deleted because it's currently in a customer's cart or wishlist. Archive it instead to hide it from the storefront.",
      });
    }

    await db.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });
      await logActivity(tx, {
        adminId,
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: id,
        description: `Deleted product ${product.name}`,
      });
    });

    await Promise.all(product.images.map((img) => deleteProductImageLocal(img.url)));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: mapProductWriteError(err) });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || 'admin';

    const product = await db.product.findUnique({
      where: { id },
      select: { name: true, status: true, slug: true, category: { select: { slug: true } } },
    });
    if (!product) {
      return res.status(404).json({ error: "This product no longer exists." });
    }

    const nextStatus = product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { status: nextStatus } });
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "PRODUCT",
        entityId: id,
        description: `Changed product status from ${product.status} to ${nextStatus}`,
        metadata: { field: "status", from: product.status, to: nextStatus },
      });
    });

    res.json({ success: true, nextStatus });
  } catch (err) {
    res.status(500).json({ error: mapProductWriteError(err) });
  }
};
