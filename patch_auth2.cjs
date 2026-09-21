const fs = require('fs');
const filePath = 'src/store/authStore.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "const dummyProfile = { id: 'guest-123', email: 'guest@zlab.app', displayName: 'Guest', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };",
  "const dummyProfile = { id: 'guest-123', email: 'guest@zlab.app', displayName: 'Guest', photoURL: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };"
);

fs.writeFileSync(filePath, code);
