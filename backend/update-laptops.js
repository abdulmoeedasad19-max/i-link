const { Client } = require('pg');
require('dotenv').config();

const updates = {
  'p1': { // HP EliteBook 840 G9
    shortDescription: `Key Specifications\nBrand / Model: HP EliteBook 840 G9\nProcessor: Intel Core i7\nMemory (RAM): 16GB RAM\nStorage: 512GB SSD\nDisplay: 14"`,
    tags: ["HP Laptops", "HP EliteBook 840 G9", "Intel Core i7 Laptop", "16GB RAM", "512GB SSD", "Business Laptop"],
    seoTitle: "HP EliteBook 840 G9 | Intel Core i7 | 16GB RAM | 512GB SSD",
    seoDescription: "Shop the HP EliteBook 840 G9 business-grade 14-inch laptop. Features Intel Core i7, 16GB RAM, 512GB SSD, and enterprise-level security."
  },
  'p2': { // Dell XPS 13 9310
    shortDescription: `Key Specifications\nBrand / Model: Dell XPS 13 9310\nProcessor: Intel Core i7, 11th Gen\nMemory (RAM): 32GB RAM\nStorage: 1TB SSD\nDisplay: InfinityEdge`,
    tags: ["Dell Laptops", "Dell XPS 13 9310", "Intel Core i7 Laptop", "32GB RAM", "1TB SSD"],
    seoTitle: "Dell XPS 13 9310 | Core i7 11th Gen | 32GB RAM | 1TB SSD",
    seoDescription: "Premium Dell XPS 13 9310 ultrabook with InfinityEdge display. Features Intel Core i7 11th Gen, 32GB RAM, and 1TB SSD for powerful performance."
  },
  'p3': { // Lenovo ThinkPad X1 Carbon Gen 11
    shortDescription: `Key Specifications\nBrand / Model: Lenovo ThinkPad X1 Carbon Gen 11\nProcessor: Intel Core i7\nMemory (RAM): 16GB RAM\nStorage: Not specified\nDisplay: Not specified`,
    tags: ["Lenovo Laptops", "Lenovo ThinkPad X1 Carbon", "Intel Core i7 Laptop", "16GB RAM", "Business Laptop"],
    seoTitle: "Lenovo ThinkPad X1 Carbon Gen 11 | Core i7 | 16GB RAM",
    seoDescription: "Lenovo ThinkPad X1 Carbon Gen 11. An ultra-lightweight carbon-fiber business laptop with Intel Core i7 and 16GB RAM."
  },
  'p4': { // ASUS ROG Zephyrus G14
    shortDescription: `Key Specifications\nBrand / Model: ASUS ROG Zephyrus G14\nProcessor: AMD Ryzen 9\nMemory (RAM): 32GB RAM\nStorage: Not specified\nDisplay: 14" Nebula QHD+\nGraphics: NVIDIA RTX 4060`,
    tags: ["ASUS Laptops", "ASUS ROG Zephyrus G14", "AMD Ryzen 9", "32GB RAM", "NVIDIA RTX 4060", "Gaming Laptop"],
    seoTitle: "ASUS ROG Zephyrus G14 | AMD Ryzen 9 | RTX 4060 | 32GB RAM",
    seoDescription: "ASUS ROG Zephyrus G14 gaming laptop featuring an AMD Ryzen 9 processor, NVIDIA RTX 4060, 32GB RAM, and a 14-inch Nebula QHD+ display."
  }
};

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  for (const [id, data] of Object.entries(updates)) {
    // get before
    const beforeRes = await client.query(`SELECT "shortDescription", tags, "seoTitle", "seoDescription" FROM "Product" WHERE id = $1`, [id]);
    const b = beforeRes.rows[0];
    
    // update
    await client.query(`
      UPDATE "Product" 
      SET "shortDescription" = $1, tags = $2, "seoTitle" = $3, "seoDescription" = $4
      WHERE id = $5
    `, [data.shortDescription, data.tags, data.seoTitle, data.seoDescription, id]);
    
    console.log(`Updated ${id}`);
    console.log(`ShortDesc: ${b.shortDescription} -> ${data.shortDescription}`);
    console.log(`Tags: ${(b.tags||[]).join(',')} -> ${data.tags.join(',')}`);
    console.log(`SEO Title: ${b.seoTitle} -> ${data.seoTitle}`);
    console.log(`SEO Desc: ${b.seoDescription} -> ${data.seoDescription}`);
    console.log('---');
  }
  
  const c = await client.query(`SELECT count(*) FROM "Collection"`);
  const pc = await client.query(`SELECT count(*) FROM "ProductCollection"`);
  console.log(`Collections: ${c.rows[0].count}`);
  console.log(`ProductCollections: ${pc.rows[0].count}`);
  
  await client.end();
}

main().catch(console.error);
