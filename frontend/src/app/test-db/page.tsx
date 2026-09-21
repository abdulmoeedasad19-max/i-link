import { getAdminProductById, getAdminCollections } from "@/lib/admin/products";
import { db } from "@/lib/db";

export default async function TestPage() {
  const c = await getAdminCollections();
  const p = await db.product.findFirst({ select: { id: true } });
  let detail = null;
  if (p) {
    detail = await getAdminProductById(p.id);
  }
  return <div>
    <h1>Test</h1>
    <pre>{JSON.stringify({ collections: c.length, detail: detail?.collectionIds }, null, 2)}</pre>
  </div>;
}

