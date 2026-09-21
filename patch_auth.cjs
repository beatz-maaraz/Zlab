const fs = require('fs');
const filePath = 'src/store/authStore.ts';
let code = fs.readFileSync(filePath, 'utf8');

const bypassCode = `
    // ---- TEMPORARY BYPASS START ----
    const dummyUser = { uid: 'guest-123', email: 'guest@zlab.app', displayName: 'Guest' };
    const dummyProfile = { id: 'guest-123', email: 'guest@zlab.app', displayName: 'Guest', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set({
      user: dummyUser as any,
      profile: dummyProfile,
      isLoading: false,
      isInitialized: true,
      authError: null,
    });
    
    useUIStore.getState().setAuthenticated(true);
    useProjectStore.getState().syncWithUser(dummyUser.uid);
    return;
    // ---- TEMPORARY BYPASS END ----
`;

code = code.replace(
  'onAuthStateChanged(auth, async (firebaseUser) => {',
  'onAuthStateChanged(auth, async (firebaseUser) => {' + bypassCode
);

fs.writeFileSync(filePath, code);
