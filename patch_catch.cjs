const fs = require('fs');
let code = fs.readFileSync('src/lib/firestoreProjects.ts', 'utf8');

const catchBlockStr = `} catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      console.warn('Firestore quota exceeded. Stopping cloud sync for this session.');
      setQuotaExceeded(true);
      return;
    }
    console.warn('Error saving project to Firestore:', err);`;

code = code.replace(`} catch (err: any) {
    console.warn('Error saving project to Firestore:', err);`, catchBlockStr);

fs.writeFileSync('src/lib/firestoreProjects.ts', code);
