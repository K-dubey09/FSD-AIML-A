const fs = require('fs');
const path = require('path');

// Usage: node scripts/upsert.js <targetFile> <payloadFile> <keyField>
// Example: node scripts/upsert.js data/users.json scripts/users-to-upsert.json username

async function main(){
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/upsert.js <targetFile> <payloadFile> <keyField>');
    process.exit(2);
  }
  const [targetFile, payloadFile, keyField] = args;
  const targetPath = path.resolve(targetFile);
  const payloadPath = path.resolve(payloadFile);

  if (!fs.existsSync(payloadPath)){
    console.error('Payload file not found:', payloadPath);
    process.exit(2);
  }
  const payload = JSON.parse(fs.readFileSync(payloadPath,'utf8'));
  if (!Array.isArray(payload)){
    console.error('Payload must be an array of objects');
    process.exit(2);
  }

  let current = [];
  if (fs.existsSync(targetPath)){
    try{
      current = JSON.parse(fs.readFileSync(targetPath,'utf8')) || [];
    }catch(e){
      console.error('Failed to parse target file, aborting:', e.message);
      process.exit(2);
    }
  }

  // Convert to map by keyField
  const map = new Map();
  current.forEach(item => {
    if (item && item[keyField] !== undefined) map.set(String(item[keyField]), item);
    else if (item && item.id !== undefined) map.set(String(item.id), item);
  });

  for (const p of payload){
    if (!p || typeof p !== 'object') continue;
    const key = p[keyField] !== undefined ? String(p[keyField]) : (p.id !== undefined ? String(p.id) : null);
    if (!key){
      // create new with id
      const newItem = { ...p };
      if (!newItem.id) newItem.id = Date.now() + Math.floor(Math.random()*1000);
      current.push(newItem);
      map.set(String(newItem[keyField] || newItem.id), newItem);
      continue;
    }
    if (map.has(key)){
      const existing = map.get(key);
      // preserve id if payload doesn't provide one
      const newItem = { ...existing, ...p };
      if (!newItem.id) newItem.id = existing.id;
      // replace in current array
      const idx = current.findIndex(x => (x[keyField] && String(x[keyField]) === key) || (x.id && String(x.id) === key));
      if (idx >= 0) current[idx] = newItem;
      map.set(key, newItem);
    } else {
      const newItem = { ...p };
      if (!newItem.id) newItem.id = Date.now() + Math.floor(Math.random()*1000);
      current.push(newItem);
      map.set(key, newItem);
    }
  }

  // Write back
  fs.writeFileSync(targetPath, JSON.stringify(current, null, 2), 'utf8');
  console.log(`Upserted ${payload.length} records into ${targetPath}`);
}

main().catch(err=>{ console.error(err); process.exit(1); });
