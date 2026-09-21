const fs = require('fs');
let text = fs.readFileSync('src/lib/products-repository.ts', 'utf8');
const startIdx = text.indexOf('export async function getLaptopsByUseCase');
if (startIdx !== -1) {
  // Find the end of the function. It ends at 	hrow wrapError(\getLaptopsByUseCase("\") failed\, error);\n  }\n}
  const endMarker = 'throw wrapError(getLaptopsByUseCase("") failed, error);\n  }\n}';
  const endIdx = text.indexOf(endMarker, startIdx);
  if (endIdx !== -1) {
    const totalEnd = endIdx + endMarker.length;
    text = text.substring(0, startIdx) + text.substring(totalEnd);
    fs.writeFileSync('src/lib/products-repository.ts', text);
    console.log('Deleted getLaptopsByUseCase');
  } else {
    console.log('Could not find end of function');
  }
} else {
  console.log('Could not find getLaptopsByUseCase');
}
