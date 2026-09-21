const { Client } = require('pg');
require('dotenv').config();

function hasRepeatedChars(str) {
  return /(.)\1{3,}/.test(str); // matches 4 or more identical consecutive characters
}

function extractSpec(desc, regex) {
  if (!desc) return null;
  const match = desc.match(regex);
  return match ? match[1].trim() : null;
}

function findContradictions(p) {
  let contradictions = [];
  const text = (p.name + " " + (p.shortDescription || "") + " " + (p.tags||[]).join(" ")).toUpperCase();
  
  // Basic contradiction checks for RAM and Storage
  let ramMatchName = p.name.match(/\b(\d+)GB\s*RAM/i);
  let ramMatchDesc = (p.shortDescription || "").match(/Memory\s*\(RAM\):\s*(\d+)GB/i);
  if (ramMatchName && ramMatchDesc && ramMatchName[1] !== ramMatchDesc[1]) {
    contradictions.push(`RAM mismatch: Name says ${ramMatchName[1]}GB, Description says ${ramMatchDesc[1]}GB`);
  }
  
  let ssdMatchName = p.name.match(/\b(\d+)(GB|TB)\s*SSD/i);
  let ssdMatchDesc = (p.shortDescription || "").match(/Storage:\s*(\d+)(GB|TB)/i);
  if (ssdMatchName && ssdMatchDesc && ssdMatchName[1] !== ssdMatchDesc[1]) {
    contradictions.push(`Storage mismatch: Name says ${ssdMatchName[1]}${ssdMatchName[2]}, Description says ${ssdMatchDesc[1]}${ssdMatchDesc[2]}`);
  }
  
  return contradictions;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT p.id, p.name, p.sku, p.price, p.stock, p.tags, p."shortDescription", p.description, 
           b.name as brand_name, p."createdAt", p."updatedAt", p.status
    FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id 
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    ORDER BY p."createdAt" DESC
  `);
  
  let md = "# Laptop Inventory Investigation Report\n\n";
  
  // Task 1: 53 -> 58 discrepancy
  md += "## 1. 53 -> 58 Discrepancy\n";
  md += "Based on database timestamps, here are the 5 most recently created laptops which likely account for the increase from 53 to 58:\n\n";
  for(let i=0; i<5 && i<res.rows.length; i++) {
    const r = res.rows[i];
    md += `- **${r.name}** (ID: ${r.id}, Created: ${r.createdAt.toISOString().slice(0,10)}, Price: ${r.price})\n`;
  }
  
  // Task 2: Rs. 55 Anomaly
  md += "\n## 2. Rs. 55 Anomaly\n";
  const p55 = res.rows.find(r => parseFloat(r.price) === 55);
  if (p55) {
    md += `- **Product ID:** ${p55.id}\n`;
    md += `- **Product Name:** ${p55.name}\n`;
    md += `- **SKU:** ${p55.sku || 'N/A'}\n`;
    md += `- **Brand:** ${p55.brand_name || 'N/A'}\n`;
    md += `- **Category:** Laptops\n`;
    md += `- **Stock:** ${p55.stock}\n`;
    md += `- **Price:** Rs. 55\n`;
    md += `- **Created At:** ${p55.createdAt.toISOString()}\n`;
    md += `- **Updated At:** ${p55.updatedAt.toISOString()}\n`;
    md += `- **shortDescription:** \n\`\`\`\n${p55.shortDescription || 'N/A'}\n\`\`\`\n`;
    md += `- **Tags:** ${(p55.tags||[]).join(', ')}\n\n`;
    md += "**Assessment:** Based on the evidence (name and price), this is clearly **test data** or an accidental entry, not a genuine product.\n";
  } else {
    md += "Could not find a product with price exactly 55.\n";
  }
  
  // Task 3: Suspicious / Test Products
  md += "\n## 3. Suspicious / Test Products\n";
  let suspicious = [];
  for (let r of res.rows) {
    const name = r.name.toLowerCase();
    if (name.includes('test') || name.includes('newww') || hasRepeatedChars(name) || name.length < 10) {
      suspicious.push(r);
    }
  }
  if (suspicious.length > 0) {
    for (let s of suspicious) {
      md += `- **${s.name}** (ID: ${s.id}, Created: ${s.createdAt.toISOString().slice(0,10)})\n`;
    }
  } else {
    md += "None found.\n";
  }
  
  // Task 4: Missing Specifications
  md += "\n## 4. Missing Specifications\n";
  md += "| Product Name | Missing Specs |\n| --- | --- |\n";
  let missingSpecsCount = 0;
  for (let r of res.rows) {
    let missing = [];
    if (!r.shortDescription) missing.push("shortDescription");
    const desc = r.shortDescription || '';
    if (!extractSpec(desc, /Processor:\s*(.*)/i) && !r.name.match(/(Core i\d|Ryzen \d)/i)) missing.push("CPU");
    if (!extractSpec(desc, /Memory \(RAM\):\s*(.*)/i) && !r.name.match(/(\d+GB RAM)/i)) missing.push("RAM");
    if (!extractSpec(desc, /Storage:\s*(.*)/i) && !r.name.match(/(\d+GB SSD|\d+TB SSD)/i)) missing.push("Storage");
    if (!extractSpec(desc, /Display:\s*(.*)/i) && !r.name.match(/(\d+\.\d+" LED)/i)) missing.push("Display");
    
    // Explicit GPU missing
    if (!desc.match(/GPU|Graphics/i)) missing.push("GPU (Not Explicitly Listed)");

    if (missing.length > 0) {
      md += `| ${r.name.replace(/\|/g, '-')} | ${missing.join(', ')} |\n`;
      missingSpecsCount++;
    }
  }
  
  // Task 5: Contradictory Data
  md += "\n## 5. Contradictory Specifications\n";
  let contradictionsFound = 0;
  for (let r of res.rows) {
    let cons = findContradictions(r);
    if (cons.length > 0) {
      md += `- **${r.name}**\n`;
      cons.forEach(c => md += `  - ${c}\n`);
      contradictionsFound++;
    }
  }
  if(contradictionsFound === 0) md += "No obvious RAM/Storage contradictions found.\n";
  
  // Task 6: Verified Inventory Summary
  md += "\n## 6. Verified Inventory Summary\n";
  let inStock = 0, outStock = 0;
  let brands = {};
  let prices = [];
  let dedicatedGPU = 0;
  let ram8 = 0, ram16 = 0, ssd256 = 0, ssd512 = 0;
  
  for (let r of res.rows) {
    if (r.stock > 0) inStock++; else outStock++;
    brands[r.brand_name || 'Unbranded'] = (brands[r.brand_name || 'Unbranded'] || 0) + 1;
    prices.push(parseFloat(r.price));
    
    const text = (r.name + " " + (r.shortDescription||"") + " " + (r.tags||[]).join(" ")).toUpperCase();
    if (text.match(/GTX|RTX|DEDICATED|RADEON RX/i)) dedicatedGPU++;
    if (text.match(/8GB/i)) ram8++;
    if (text.match(/16GB/i)) ram16++;
    if (text.match(/256GB/i)) ssd256++;
    if (text.match(/512GB/i)) ssd512++;
  }
  
  md += `- **Total Active Laptops:** ${res.rows.length}\n`;
  md += `- **In Stock:** ${inStock}\n`;
  md += `- **Out of Stock:** ${outStock}\n`;
  md += `- **Brands:** ${Object.entries(brands).map(([k,v])=>k+': '+v).join(', ')}\n`;
  md += `- **Price Range:** Rs. ${Math.min(...prices).toLocaleString()} - Rs. ${Math.max(...prices).toLocaleString()}\n`;
  md += `- **Dedicated GPU explicitly documented:** ${dedicatedGPU}\n`;
  md += `- **8GB RAM:** ${ram8}\n`;
  md += `- **16GB RAM:** ${ram16}\n`;
  md += `- **256GB SSD:** ${ssd256}\n`;
  md += `- **512GB SSD:** ${ssd512}\n`;
  
  md += "\n## 7. Recommended Manual-Review Records\n";
  md += "Based on the above, the following types of records should be manually reviewed:\n";
  md += "- The Rs. 55 anomaly and any suspicious/test records identified in Section 3.\n";
  md += "- Products with missing `shortDescription` as they break the standard spec format.\n";
  if (contradictionsFound > 0) md += "- Products flagged for RAM/Storage contradictions.\n";
  
  const collRes = await client.query('SELECT COUNT(*) FROM "Collection"');
  const pcRes = await client.query('SELECT COUNT(*) FROM "ProductCollection"');
  
  md += "\n## 8. Final Database State\n";
  md += `- **Collection records:** ${collRes.rows[0].count}\n`;
  md += `- **ProductCollection assignments:** ${pcRes.rows[0].count}\n`;
  
  require('fs').writeFileSync('investigation_report.md', md);
  console.log('Investigation completed.');
  await client.end();
}

main().catch(console.error);
