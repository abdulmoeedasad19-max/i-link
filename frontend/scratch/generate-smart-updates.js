const fs = require('fs');

const laptops = JSON.parse(fs.readFileSync('scratch/hp-laptops.json', 'utf8'));
const COLLECTIONS = {
  student: 'cmu5fonty0000w4wivfbi63f6',
  office: 'cmu5foo2j0001w4wiymv864wk',
  business: 'cmu5fooa30002w4wi3hqgt7i6',
  programming: 'cuid_prog',
  gaming: 'cuid_game'
};

const updates = laptops.map(laptop => {
  const parts = laptop.name.split('|').map(p => p.trim());
  let modelRaw = parts[0] || 'HP Laptop';
  // Capitalize properly: "HP PROBOOK 430G7" -> "HP ProBook 430 G7"
  let model = modelRaw.replace(/PROBOOK/i, 'ProBook').replace(/ELITEBOOK/i, 'EliteBook').replace(/PAVILION/i, 'Pavilion');
  model = model.replace(/([0-9]+)(G[0-9]+)/i, '$1 $2');

  const cpuRaw = parts[1] || '';
  const ramRaw = parts[2] || '';
  const storageRaw = parts[3] || '';
  const displayRaw = parts[4] || '';

  const isI3 = cpuRaw.toLowerCase().includes('i3');
  const isI5 = cpuRaw.toLowerCase().includes('i5');
  const isI7 = cpuRaw.toLowerCase().includes('i7');
  const hasGPU = laptop.name.toLowerCase().includes('nvidia') || laptop.name.toLowerCase().includes('amd');

  const cpuFormatted = cpuRaw.replace(/CI3/i, 'Intel Core i3').replace(/CI5/i, 'Intel Core i5').replace(/CI7/i, 'Intel Core i7');
  
  const title = `${model} (${cpuFormatted}, ${ramRaw}, ${storageRaw}${displayRaw ? `, ${displayRaw}` : ''})`;
  const slug = laptop.slug.replace(/charger-included|condition/gi, '').replace(/-+/g, '-').replace(/-$/, '');

  const shortDesc = `The ${model} is a reliable laptop featuring a ${cpuFormatted} processor, ${ramRaw}, and a fast ${storageRaw}. ${displayRaw ? `Enjoy clear visuals on its ${displayRaw} display.` : ''} Fully tested and ready to use, original charger included.`;

  const description = `
  <h3>Overview</h3>
  <p>Boost your productivity with the ${model}. Designed for modern professionals and students, this laptop delivers essential performance in a durable chassis.</p>
  
  <h3>Performance</h3>
  <p>Powered by a ${cpuFormatted} processor, it handles daily tasks like web browsing, document editing, and email management with ease.</p>
  
  ${displayRaw ? `<h3>Display</h3><p>The ${displayRaw} display provides sharp, vibrant visuals for comfortable viewing during long work sessions.</p>` : ''}
  
  <h3>Storage and Memory</h3>
  <p>Equipped with ${ramRaw} for smooth multitasking and a ${storageRaw} for rapid boot times and snappy application launches.</p>
  
  <h3>Graphics</h3>
  <p>Integrated graphics for reliable performance in everyday office applications.</p>
  
  <h3>Who This HP Laptop Is For</h3>
  <ul>
    ${isI7 || isI5 ? '<li>Business executives and professionals</li>' : ''}
    ${hasGPU ? '<li>Graphic designers and casual gamers</li>' : ''}
    <li>Students and educators</li>
    <li>Office workers and remote professionals</li>
  </ul>
  
  <h3>Important Product Details</h3>
  <p>Includes original charger. Fully tested and sanitized. Condition: Used/Refurbished.</p>
  
  <h3>Why Buy From i.Link</h3>
  <p>We offer nationwide delivery, verified quality assurance, and competitive market pricing in Pakistan.</p>
  `;

  const tags = ["HP Laptops", model, cpuFormatted.split(' ')[0] + ' ' + (cpuFormatted.split(' ')[1] || ''), isI7 ? "High Performance" : "Business Laptop", "Student Laptop", "Used Laptops"];
  
  let cols = [COLLECTIONS.office];
  if (isI3) cols = [COLLECTIONS.student, COLLECTIONS.office];
  if (isI5) cols = [COLLECTIONS.student, COLLECTIONS.office, COLLECTIONS.business];
  if (isI7) cols = [COLLECTIONS.business, COLLECTIONS.programming];
  if (hasGPU) cols.push(COLLECTIONS.gaming);

  const imageUpdates = laptop.images.map((img, i) => ({
    id: img.id,
    altText: `${model} ${cpuFormatted} laptop view ${i+1}`
  }));

  return {
    id: laptop.id,
    oldSlug: laptop.slug,
    slug: slug.toLowerCase(),
    name: title,
    shortDescription: shortDesc,
    description: description.trim(),
    tags: [...new Set(tags)],
    seoTitle: `${model} | ${cpuFormatted} | ${ramRaw} ${storageRaw}`,
    seoDescription: `Buy the ${model} featuring ${cpuFormatted}, ${ramRaw}, and ${storageRaw}. Reliable performance at the best price in Pakistan from i.Link.`,
    collections: [...new Set(cols)],
    imageUpdates
  };
});

fs.writeFileSync('scratch/updates.json', JSON.stringify(updates, null, 2));
console.log('Updates generated successfully.');

