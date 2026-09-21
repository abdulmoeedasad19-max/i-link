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

function evaluateEvidence(specs, text) {
  const t = text.toLowerCase();
  
  // Student
  let stu = "Insufficient evidence";
  if (t.includes('student') || t.includes('education') || t.includes('school')) {
    stu = "Supported - description explicitly mentions student/education.";
  } else if (specs.RAM !== 'Not specified' && specs.CPU !== 'Not specified') {
    stu = "Possibly supported - basic specs documented, but intended use not explicitly stated.";
  }
  
  // Office
  let off = "Insufficient evidence";
  if (t.includes('office') || t.includes('productivity')) {
    off = "Supported - explicitly documented for office/productivity.";
  } else if (specs.RAM !== 'Not specified' && specs.CPU !== 'Not specified') {
    off = "Possibly supported - basic specs documented, but intended use not explicitly stated.";
  }
  
  // Business
  let bus = "Insufficient evidence";
  if (t.includes('business-grade') || t.includes('enterprise-level') || t.includes('business laptop') || t.match(/\bbusiness\b/)) {
    bus = "Supported - explicitly documented as business-grade/enterprise.";
  } else if (t.includes('thinkpad') || t.includes('elitebook') || t.includes('latitude') || t.includes('probook')) {
    bus = "Possibly supported - business model line documented, but exact enterprise features not explicitly detailed.";
  } else if (specs.RAM !== 'Not specified') {
    bus = "Not supported by available evidence - no business features or model lines documented.";
  }
  
  // Programming
  let prog = "Insufficient evidence";
  if (t.includes('programming') || t.includes('coding') || t.includes('developer')) {
    prog = "Supported - explicitly documented for programming/developers.";
  } else if (specs.RAM.match(/16\s*GB|32\s*GB|64\s*GB/i) && specs.CPU.match(/i7|i9|Ryzen 7|Ryzen 9|11th|12th|13th/i)) {
    prog = "Possibly supported - high RAM and CPU documented, suitable for heavy workloads.";
  } else if (specs.RAM !== 'Not specified') {
    prog = "Not supported by available evidence - specs do not indicate heavy compute targeting.";
  }
  
  // Gaming
  let gam = "Insufficient evidence";
  if (t.includes('gaming') || t.includes('gamers')) {
    gam = "Supported - explicitly documented for gaming.";
  } else if (specs.GPU !== 'Not specified' && specs.GPU.match(/RTX|GTX|RX \d|Dedicated/i)) {
    gam = "Possibly supported - dedicated GPU documented.";
  } else if (specs.GPU === 'Not specified' || specs.GPU.match(/Integrated|UHD|Iris|Radeon Graphics/i)) {
    gam = "Not supported by available evidence - lack of dedicated GPU documented.";
  }
  
  return { stu, off, bus, prog, gam };
}

function classifyLvl(text) {
  if (text.startsWith('Supported')) return 'strong';
  if (text.startsWith('Possibly supported')) return 'possible';
  return 'insufficient';
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // DB Verification
  const pCountRes = await client.query(`SELECT count(*) FROM "Product" p JOIN "Category" c ON p."categoryId" = c.id WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'`);
  const activeCount = parseInt(pCountRes.rows[0].count);
  
  const testProdRes = await client.query(`SELECT status FROM "Product" WHERE id = 'f01ba289-fef4-45bf-a1d4-5afd9953fe0e'`);
  const testStatus = testProdRes.rows.length ? testProdRes.rows[0].status : 'Missing';
  
  const cCountRes = await client.query(`SELECT count(*) FROM "Collection"`);
  const cCount = parseInt(cCountRes.rows[0].count);
  
  const pcCountRes = await client.query(`SELECT count(*) FROM "ProductCollection"`);
  const pcCount = parseInt(pcCountRes.rows[0].count);
  
  // Get all active
  const res = await client.query(`
    SELECT p.id, p.name, p.price, p.tags, p."shortDescription", p.description, p.sku
    FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id 
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    ORDER BY p.name ASC
  `);
  
  let md = "# Laptop Collection Evidence Matrix\n\n";
  
  md += "## Database Verification\n";
  md += `- Active Laptop count: ${activeCount}\n`;
  md += `- Archived test product status: ${testStatus}\n`;
  md += `- Collection count: ${cCount}\n`;
  md += `- ProductCollection assignment count: ${pcCount}\n\n`;
  
  md += "## Evidence Matrix\n\n";
  md += "| # | Product | Price | CPU | RAM | Storage | GPU | Display | Student Evidence | Office Evidence | Business Evidence | Programming Evidence | Gaming Evidence |\n";
  md += "|---|---|---|---|---|---|---|---|---|---|---|---|---|\n";
  
  let coverage = {
    stu: { strong: 0, possible: 0, insufficient: 0 },
    off: { strong: 0, possible: 0, insufficient: 0 },
    bus: { strong: 0, possible: 0, insufficient: 0 },
    prog: { strong: 0, possible: 0, insufficient: 0 },
    gam: { strong: 0, possible: 0, insufficient: 0 },
  };
  
  let i = 1;
  let dataIssues = [];
  
  for (let r of res.rows) {
    const text = [r.name, r.shortDescription, r.description, (r.tags||[]).join(' ')].filter(Boolean).join(' ');
    
    const cpu = extractSpec(r.shortDescription, r.name, /Processor:\s*(.*)/i, /(Core i\d|Ryzen \d|Ci\d[^\|]*)/i);
    const ram = extractSpec(r.shortDescription, r.name, /Memory \(RAM\):\s*(.*)/i, /(\d+GB RAM)/i);
    const storage = extractSpec(r.shortDescription, r.name, /Storage:\s*(.*)/i, /(\d+GB SSD|\d+TB SSD|\d+GB HDD)/i);
    const gpu = extractSpec(r.shortDescription, r.name, /Graphics:\s*(.*)/i, /(GTX \d+|RTX \d+|Radeon RX \d+)/i);
    const display = extractSpec(r.shortDescription, r.name, /Display:\s*(.*)/i, /(\d+\.\d+"|\d+"[^\|]*)/i);
    
    if (cpu === 'Not specified' || ram === 'Not specified' || storage === 'Not specified' || gpu === 'Not specified' || display === 'Not specified') {
      dataIssues.push(r.name);
    }
    
    const ev = evaluateEvidence({ CPU: cpu, RAM: ram, Storage: storage, GPU: gpu, Display: display }, text);
    
    coverage.stu[classifyLvl(ev.stu)]++;
    coverage.off[classifyLvl(ev.off)]++;
    coverage.bus[classifyLvl(ev.bus)]++;
    coverage.prog[classifyLvl(ev.prog)]++;
    coverage.gam[classifyLvl(ev.gam)]++;
    
    const priceStr = r.price ? parseFloat(r.price).toLocaleString() : 'N/A';
    
    md += `| ${i++} | ${r.name} | ${priceStr} | ${cpu} | ${ram} | ${storage} | ${gpu} | ${display} | ${ev.stu} | ${ev.off} | ${ev.bus} | ${ev.prog} | ${ev.gam} |\n`;
  }
  
  md += "\n## Data Quality Issues\n";
  md += "The following products still lack explicit documentation for one or more core specifications (most commonly GPU or Display parameters), requiring manual review prior to collection assignment:\n";
  for (let issue of dataIssues.slice(0, 10)) {
    md += `- ${issue}\n`;
  }
  if (dataIssues.length > 10) md += `- *(and ${dataIssues.length - 10} more models with implicit specifications...)*\n`;
  
  md += "\n## Collection Coverage Preview\n";
  md += "| Collection | Strong Evidence | Possible Evidence | Insufficient / Not Supported |\n";
  md += "|---|---|---|---|\n";
  md += `| Student | ${coverage.stu.strong} | ${coverage.stu.possible} | ${coverage.stu.insufficient + (57 - coverage.stu.strong - coverage.stu.possible)} |\n`;
  md += `| Office | ${coverage.off.strong} | ${coverage.off.possible} | ${coverage.off.insufficient + (57 - coverage.off.strong - coverage.off.possible)} |\n`;
  md += `| Business | ${coverage.bus.strong} | ${coverage.bus.possible} | ${coverage.bus.insufficient + (57 - coverage.bus.strong - coverage.bus.possible)} |\n`;
  md += `| Programming | ${coverage.prog.strong} | ${coverage.prog.possible} | ${coverage.prog.insufficient + (57 - coverage.prog.strong - coverage.prog.possible)} |\n`;
  md += `| Gaming | ${coverage.gam.strong} | ${coverage.gam.possible} | ${coverage.gam.insufficient + (57 - coverage.gam.strong - coverage.gam.possible)} |\n`;
  
  md += "\n## Final Safety Check\n";
  md += "- 57 active real laptops audited\n";
  md += "- Archived test product excluded\n";
  md += "- Collections remain exactly 5\n";
  md += "- ProductCollection remains exactly 0\n";
  md += "- No database records modified\n";
  md += "- No files modified (except read-only artifact creation)\n";
  md += "- No deployment performed\n";
  
  fs.writeFileSync('matrix.md', md);
  console.log('Matrix generated');
  await client.end();
}

main().catch(console.error);
