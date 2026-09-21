const { Client } = require('pg');
require('dotenv').config();

function extractSpec(desc, name, regex, nameRegex) {
  if (desc) {
    const m = desc.match(regex);
    if (m) return m[1].trim();
  }
  if (name && nameRegex) {
    const m = name.match(nameRegex);
    if (m) return m[1].trim();
  }
  return 'Not specified';
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    // 1. Fetch Collections
    const collRes = await client.query(`SELECT id, slug, "categoryId" FROM "Collection"`);
    const collections = {};
    let laptopCategoryId = null;
    for (let c of collRes.rows) {
      collections[c.slug] = c.id;
      if (!laptopCategoryId) laptopCategoryId = c.categoryId; // all belong to same Laptops cat based on previous steps
    }
    
    // 2. Fetch Laptops
    const prodRes = await client.query(`
      SELECT p.id, p.name, p.price, p.tags, p."shortDescription", p.description, p."categoryId"
      FROM "Product" p 
      JOIN "Category" c ON p."categoryId" = c.id 
      WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    `);
    
    if (prodRes.rows.length !== 57) {
      throw new Error(`Expected 57 active laptops, found ${prodRes.rows.length}`);
    }
    
    const assignments = []; // { productId, collectionId }
    
    let totals = { student: 0, office: 0, business: 0, programming: 0, gaming: 0 };
    
    for (let p of prodRes.rows) {
      if (p.categoryId !== laptopCategoryId) {
        throw new Error(`Product ${p.name} category mismatch!`);
      }
      
      const text = [p.name, p.shortDescription, p.description, (p.tags||[]).join(' ')].filter(Boolean).join(' ').toLowerCase();
      
      const cpu = extractSpec(p.shortDescription, p.name, /Processor:\s*(.*)/i, /(Core i\d|Ryzen \d|Ci\d[^\|]*)/i) || "";
      const ramStr = extractSpec(p.shortDescription, p.name, /Memory \(RAM\):\s*(.*)/i, /(\d+GB RAM)/i) || "";
      const display = extractSpec(p.shortDescription, p.name, /Display:\s*(.*)/i, /(\d+\.\d+"|\d+"[^\|]*)/i) || "";
      const ram = parseInt((ramStr.match(/(\d+)\s*GB/i) || [0,0])[1]);
      
      const isEnterprise = text.includes('latitude') || text.includes('elitebook') || text.includes('probook') || text.includes('thinkpad');
      const isBusiness = isEnterprise || text.includes('business-grade') || text.includes('enterprise-level') || text.includes('business laptop');
      
      const isGaming = text.includes('rog zephyrus') || (text.includes('gaming') && text.includes('rtx'));
      
      // Office: Enterprise laptops or specifically productivity mentioned
      // Inspiron, Envy, XPS can be office if they have 8GB+ and are not huge gaming rigs.
      const isOffice = isBusiness || (ram >= 8 && !isGaming && (text.includes('productivity') || text.includes('office') || text.includes('xps') || text.includes('envy') || text.includes('inspiron')));
      
      // Student: Portability (12-14 inch) or explicit student mention.
      // Exclude heavy 15.6 inch workstations unless they say student.
      const isStudent = text.includes('student') || text.includes('education') || (isOffice && (display.includes('12') || display.includes('13') || display.includes('14') || display === 'Not specified' || text.includes('ultrabook')));
      
      // Programming: Highly conservative
      const is11thGenPlus = cpu.match(/11th|12th|13th/i);
      const isHighEndCpu = cpu.match(/i7|i9|Ryzen 9/i);
      const isProgramming = (ram >= 32) || (ram >= 16 && isHighEndCpu && is11thGenPlus) || text.includes('programming') || text.includes('developer');
      
      if (isStudent) {
        assignments.push({ pId: p.id, cId: collections['student'] });
        totals.student++;
      }
      if (isOffice) {
        assignments.push({ pId: p.id, cId: collections['office'] });
        totals.office++;
      }
      if (isBusiness) {
        assignments.push({ pId: p.id, cId: collections['business'] });
        totals.business++;
      }
      if (isProgramming) {
        assignments.push({ pId: p.id, cId: collections['programming'] });
        totals.programming++;
      }
      if (isGaming) {
        assignments.push({ pId: p.id, cId: collections['gaming'] });
        totals.gaming++;
      }
    }
    
    // Deduplicate pairs just in case
    const uniqueAssignments = [];
    const seen = new Set();
    for (let a of assignments) {
      const key = `${a.pId}-${a.cId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAssignments.push(a);
      }
    }
    
    // Write to DB
    await client.query('BEGIN');
    
    // Double check we are not touching other things
    const currCountRes = await client.query(`SELECT count(*) FROM "ProductCollection"`);
    if (parseInt(currCountRes.rows[0].count) !== 0) {
      throw new Error("ProductCollection is not empty before insertion! Aborting.");
    }
    
    let insertValues = [];
    for (let a of uniqueAssignments) {
      insertValues.push(`('${a.pId}', '${a.cId}')`);
    }
    
    if (insertValues.length > 0) {
      const query = `INSERT INTO "ProductCollection" ("productId", "collectionId") VALUES ${insertValues.join(', ')}`;
      await client.query(query);
    }
    
    await client.query('COMMIT');
    
    console.log("Successfully wrote assignments to DB.");
    console.log(`Student: ${totals.student}`);
    console.log(`Office: ${totals.office}`);
    console.log(`Business: ${totals.business}`);
    console.log(`Programming: ${totals.programming}`);
    console.log(`Gaming: ${totals.gaming}`);
    console.log(`Total assignments created: ${uniqueAssignments.length}`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error writing assignments:", err);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
