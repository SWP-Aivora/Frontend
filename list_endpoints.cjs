const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Aivoraapi  v1.json', 'utf8'));
console.log(Object.keys(data.paths).join('\n'));
