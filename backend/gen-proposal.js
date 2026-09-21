const { Client } = require('pg');
const fs = require('fs');
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
  
  const res = await client.query(`
    SELECT p.id, p.name, p.price, p.tags, p."shortDescription", p.description, p.sku
    FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id 
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    ORDER BY p.name ASC
  `);
  
  let md = "# Laptop Curation Proposal\n\n";
  md += "| # | Product | Student | Office | Business | Programming | Gaming | Reason |\n";
  md += "|---|---|---|---|---|---|---|---|\n";
  
  let counts = { Student: 0, Office: 0, Business: 0, Programming: 0, Gaming: 0 };
  let reviewProducts = [];
  let insufficientProducts = [];
  
  let i = 1;
  for (let r of res.rows) {
    const text = [r.name, r.shortDescription, r.description, (r.tags||[]).join(' ')].filter(Boolean).join(' ').toLowerCase();
    
    // Extracted specs
    const cpuStr = extractSpec(r.shortDescription, r.name, /Processor:\s*(.*)/i, /(Core i\d|Ryzen \d|Ci\d[^\|]*)/i) || "";
    const ramStr = extractSpec(r.shortDescription, r.name, /Memory \(RAM\):\s*(.*)/i, /(\d+GB RAM)/i) || "";
    const gpuStr = extractSpec(r.shortDescription, r.name, /Graphics:\s*(.*)/i, /(GTX \d+|RTX \d+|Radeon RX \d+|2GB GPU|2GB Dedicated)/i) || "";
    
    const ram = parseInt((ramStr.match(/(\d+)\s*GB/i) || [0,0])[1]);
    const isBusinessBrand = text.includes('latitude') || text.includes('elitebook') || text.includes('probook') || text.includes('thinkpad') || text.includes('business');
    const isGamingBrand = text.includes('rog ') || text.includes('gaming');
    const hasDedicatedGpu = text.includes('rtx') || text.includes('gtx') || text.includes('radeon rx') || text.match(/2gb dedicated/i) || text.match(/2gb gpu/i);
    const isModernHighEnd = cpuStr.match(/10th|11th|12th|13th|Ryzen 9/i);
    const isHighEndCPU = cpuStr.match(/i7|i9|Ryzen 7|Ryzen 9/i);
    
    const price = parseFloat(r.price) || 0;
    
    let stu = "NO", off = "NO", bus = "NO", prog = "NO", gam = "NO";
    let reasons = [];
    
    // OFFICE
    if (ram >= 8 && !isGamingBrand) {
      off = "YES";
    }
    
    // BUSINESS
    if (isBusinessBrand) {
      bus = "YES";
    } else if (off === "YES" && price > 100000) {
      bus = "REVIEW";
    }
    
    // STUDENT
    if (off === "YES") {
      if (text.includes('15.6') && price > 150000) {
        stu = "REVIEW";
        reasons.push("Large screen/high price may reduce student viability.");
      } else {
        stu = "YES";
      }
    }
    
    // PROGRAMMING
    if (ram >= 32 || (ram >= 16 && isModernHighEnd && isHighEndCPU)) {
      prog = "YES";
      reasons.push(`Prog YES: ${ram}GB RAM + ${isHighEndCPU[0]} (${isModernHighEnd ? 'modern' : 'older'}).`);
    } else if (ram >= 16 && isHighEndCPU) {
      prog = "REVIEW";
      reasons.push(`Prog REVIEW: ${ram}GB RAM + ${isHighEndCPU[0]} but exact generation/performance tier needs confirmation.`);
    } else if (text.includes('programming') || text.includes('developer')) {
      prog = "YES";
      reasons.push("Explicitly positioned for programming.");
    }
    
    // GAMING
    if (isGamingBrand && hasDedicatedGpu) {
      gam = "YES";
      reasons.push(`Gaming YES: Explicit gaming positioning + dedicated GPU.`);
    } else if (hasDedicatedGpu) {
      gam = "REVIEW";
      reasons.push(`Gaming REVIEW: Has dedicated GPU but is not a gaming-branded laptop.`);
    } else if (isGamingBrand) {
      gam = "REVIEW";
      reasons.push(`Gaming REVIEW: Gaming branded but explicit GPU not confirmed.`);
    }
    
    if (stu==="YES") counts.Student++;
    if (off==="YES") counts.Office++;
    if (bus==="YES") counts.Business++;
    if (prog==="YES") counts.Programming++;
    if (gam==="YES") counts.Gaming++;
    
    if (stu==="REVIEW" || off==="REVIEW" || bus==="REVIEW" || prog==="REVIEW" || gam==="REVIEW") {
      reviewProducts.push(r.name);
    }
    
    if (stu==="NO" && off==="NO" && bus==="NO" && prog==="NO" && gam==="NO") {
      insufficientProducts.push(r.name);
    }
    
    let reasonText = reasons.length > 0 ? reasons.join(' ') : "Standard spec mapping.";
    md += `| ${i++} | ${r.name} | ${stu} | ${off} | ${bus} | ${prog} | ${gam} | ${reasonText} |\n`;
  }
  
  md += `\n## Collection Totals\n`;
  md += `- **Proposed Student count:** ${counts.Student}\n`;
  md += `- **Proposed Office count:** ${counts.Office}\n`;
  md += `- **Proposed Business count:** ${counts.Business}\n`;
  md += `- **Proposed Programming count:** ${counts.Programming}\n`;
  md += `- **Proposed Gaming count:** ${counts.Gaming}\n`;
  
  md += `\n## Products Requiring Manual Review\n`;
  if (reviewProducts.length > 0) {
    reviewProducts.forEach(p => md += `- ${p}\n`);
  } else {
    md += "None.\n";
  }
  
  md += `\n## Products with Insufficient Evidence (No Assignments)\n`;
  if (insufficientProducts.length > 0) {
    insufficientProducts.forEach(p => md += `- ${p}\n`);
  } else {
    md += "None. All products have at least one proposed assignment.\n";
  }
  
  fs.writeFileSync('curation_proposal.md', md);
  console.log('Proposal generated');
  await client.end();
}

main().catch(console.error);
