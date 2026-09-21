const { Client } = require('pg');
require('dotenv').config();

function extractSpec(desc, regex) {
  if (!desc) return 'Not specified';
  const match = desc.match(regex);
  return match ? match[1].trim() : 'Not specified';
}

function classifyEvidence(p) {
  let ev = [];
  
  // CPU
  const cpu = p.Processor || '';
  if (cpu.match(/i7|i9|Ryzen 7|Ryzen 9/i)) ev.push('- High-performance CPU suitable for heavy Programming/Coding or Gaming');
  else if (cpu.match(/i5|Ryzen 5/i)) ev.push('- Mid-range CPU suitable for Office, Business, or general Student use');
  else if (cpu.match(/i3|Celeron|Pentium|Athlon/i)) ev.push('- Entry-level CPU suitable for basic Student or light Office tasks');
  
  // RAM
  const ram = p.Memory || '';
  if (ram.match(/16\s*GB|32\s*GB/i)) ev.push('- 16GB+ RAM supports intensive Programming, complex Business multitasking, and Gaming');
  else if (ram.match(/8\s*GB/i)) ev.push('- 8GB RAM is standard for general Office and Student use');
  
  // Storage
  const storage = p.Storage || '';
  if (storage.match(/512\s*GB|1\s*TB|2\s*TB/i)) ev.push('- Large storage (512GB+) accommodates big IDEs for Programming or large Games');
  
  // GPU
  const gpu = p.display || p.shortDesc || p.name || p.tags.join(' ');
  if (gpu.match(/GTX|RTX|Radeon RX/i)) ev.push('- Dedicated GPU strongly supports Gaming and Graphics programming');
  else if (gpu.match(/Intel|UHD|Iris|Radeon/i)) ev.push('- Integrated graphics suitable for Business, Office, and Student use (not Gaming)');
  
  // Model Families
  const model = p.name + ' ' + (p.BrandModel || '');
  if (model.match(/ThinkPad|Latitude|EliteBook|ProBook|Vostro/i)) ev.push('- Enterprise/Business model line (highly relevant for Business/Office)');
  if (model.match(/Legion|Alienware|ROG|TUF|Nitro/i)) ev.push('- Gaming brand family (strongly indicates Gaming classification)');
  
  // Tags
  const tagsStr = p.tags.join(', ');
  if (tagsStr.match(/Business/i)) ev.push('- Tagged explicitly as "Business Laptop"');
  if (tagsStr.match(/Student/i)) ev.push('- Tagged explicitly for Students');
  if (tagsStr.match(/Gaming/i)) ev.push('- Tagged explicitly for Gaming');

  return ev.length > 0 ? ev.join('\n') : '- No specific classification indicators identified';
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT p.id, p.name, p.sku, p.price, p.stock, p.tags, p."shortDescription", p.description, 
           b.name as brand_name 
    FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id 
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    ORDER BY p.name ASC
  `);
  
  let totalActive = res.rows.length;
  let inStock = 0;
  let outOfStock = 0;
  let brands = {};
  let prices = [];
  let dedicatedGPU = 0;
  let ram8 = 0;
  let ram16 = 0;
  let ssd256 = 0;
  let ssd512 = 0;
  
  let md = "# Laptop Inventory & Curation Report\n\n";
  md += "## Part 1: Complete Active Inventory\n\n";
  
  for (let r of res.rows) {
    if (r.stock > 0) inStock++; else outOfStock++;
    brands[r.brand_name] = (brands[r.brand_name] || 0) + 1;
    if (r.price) prices.push(parseFloat(r.price));
    
    // Parse specs
    const desc = r.shortDescription || '';
    r.Processor = extractSpec(desc, /Processor:\s*(.*)/i);
    r.Memory = extractSpec(desc, /Memory \(RAM\):\s*(.*)/i);
    r.Storage = extractSpec(desc, /Storage:\s*(.*)/i);
    r.Display = extractSpec(desc, /Display:\s*(.*)/i);
    r.BrandModel = extractSpec(desc, /Brand \/ Model:\s*(.*)/i);
    
    // Fallback to name parsing if not found in shortDescription
    if (r.Processor === 'Not specified') {
      const pMatch = r.name.match(/(Ci\d \d+TH Gen|Core i\d|Ryzen \d)/i);
      if (pMatch) r.Processor = pMatch[1];
    }
    if (r.Memory === 'Not specified') {
      const mMatch = r.name.match(/(\d+GB RAM)/i);
      if (mMatch) r.Memory = mMatch[1];
    }
    if (r.Storage === 'Not specified') {
      const sMatch = r.name.match(/(\d+GB SSD|\d+TB SSD)/i);
      if (sMatch) r.Storage = sMatch[1];
    }
    
    if (r.Memory.match(/8GB/i)) ram8++;
    if (r.Memory.match(/16GB/i)) ram16++;
    if (r.Storage.match(/256GB/i)) ssd256++;
    if (r.Storage.match(/512GB/i)) ssd512++;
    
    const combinedStr = r.name + ' ' + (r.tags||[]).join(' ') + ' ' + desc;
    if (combinedStr.match(/GTX|RTX|Dedicated|NVIDIA/i)) dedicatedGPU++;
    
    md += `### ${r.name}\n`;
    md += `- **ID:** \`${r.id}\`\n`;
    md += `- **Brand:** ${r.brand_name || 'Not specified'}\n`;
    md += `- **SKU:** ${r.sku || 'Not specified'}\n`;
    md += `- **Price (PKR):** Rs. ${parseFloat(r.price).toLocaleString()}\n`;
    md += `- **Stock:** ${r.stock} ${r.stock === 0 ? '*(OUT OF STOCK)*' : ''}\n`;
    md += `- **Processor:** ${r.Processor}\n`;
    md += `- **RAM:** ${r.Memory}\n`;
    md += `- **Storage:** ${r.Storage}\n`;
    md += `- **Display:** ${r.Display}\n`;
    md += `- **Tags:** ${(r.tags||[]).join(', ') || 'None'}\n`;
    md += `- **Current Collections:** None (0)\n\n`;
  }
  
  md += "\n## Part 2: Curation Evidence\n\n";
  for (let r of res.rows) {
    md += `### ${r.name} (${r.sku || r.id})\n`;
    md += classifyEvidence(r) + "\n\n";
  }
  
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  
  md += "\n## Part 3: Data Quality Summary\n\n";
  md += `- **Total Active Laptops:** ${totalActive}\n`;
  md += `- **In Stock:** ${inStock}\n`;
  md += `- **Out of Stock:** ${outOfStock}\n`;
  md += `- **Price Range:** Rs. ${minPrice.toLocaleString()} - Rs. ${maxPrice.toLocaleString()}\n`;
  md += `- **Dedicated GPU explicitly documented:** ${dedicatedGPU}\n`;
  md += `- **8GB RAM:** ${ram8}\n`;
  md += `- **16GB RAM:** ${ram16}\n`;
  md += `- **256GB SSD:** ${ssd256}\n`;
  md += `- **512GB SSD:** ${ssd512}\n`;
  md += `\n**Brands:**\n`;
  for (let b in brands) {
    md += `- ${b || 'Unbranded'}: ${brands[b]}\n`;
  }
  
  md += `\n**Data Inconsistencies Flagged:**\n`;
  md += `- Many laptops lack explicit GPU specifications in the standard \`shortDescription\` format, requiring assumption of integrated graphics.\n`;
  md += `- Some laptops may require full description review to confirm advanced specs like touchscreens or exact processor generations.\n`;
  
  require('fs').writeFileSync('report.md', md);
  console.log('Report generated at report.md');
  await client.end();
}

main().catch(console.error);
