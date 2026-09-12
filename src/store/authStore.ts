import { create } from 'zustand';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  fbSignOut,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  FirebaseUser,
  db,
  doc,
  setDoc,
  getDoc,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  deleteAllUserProjectsFromFirestore,
  deleteUserProfileFromFirestore,
} from '../lib/firestoreProjects';
import { useUIStore } from './uiStore';
import { useProjectStore } from './projectStore';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  authError: string | null;

  signInWithGoogle: () => Promise<FirebaseUser>;
  signInWithEmail: (email: string, pass: string) => Promise<FirebaseUser>;
  signUpWithEmail: (fullName: string, email: string, pass: string) => Promise<FirebaseUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  reauthenticateWithGoogleAndDelete: () => Promise<void>;
  clearError: () => void;
}

function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in attempt was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is currently unavailable. Please use email and password.';
    case 'auth/requires-recent-login':
      return 'For security reasons, deleting your account requires recent authentication. Please sign out, sign back in, and try deleting your account again.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const now = new Date().toISOString();
  const userRef = doc(db, 'users', user.uid);
  let existingProfile: Partial<UserProfile> = {};

  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingProfile = snap.data() as Partial<UserProfile>;
    }
  } catch (e: any) {
    if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  }

  const profile: UserProfile = {
    id: user.uid,
    email: user.email,
    displayName: user.displayName || existingProfile.displayName || (user.email ? user.email.split('@')[0] : 'Designer'),
    photoURL: user.photoURL || existingProfile.photoURL || null,
    createdAt: existingProfile.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(userRef, profile, { merge: true });
  } catch (e: any) {
    console.warn('Failed to sync user profile in Firestore:', e);
    if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  return profile;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Setup persistent onAuthStateChanged listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await syncUserProfile(firebaseUser);
      set({
        user: firebaseUser,
        profile,
        isLoading: false,
        isInitialized: true,
        authError: null,
      });

      // Synchronize with UI store and user settings
      const uiStore = useUIStore.getState();
      uiStore.setAuthenticated(true);
      const name = profile.displayName || 'Designer';
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'ZL';

      uiStore.updateUserSettings({
        fullName: name,
        email: profile.email || '',
        avatarText: initials,
        username: profile.email ? profile.email.split('@')[0] : 'designer',
      });

      // Sync user projects from Firestore
      try {
        await useProjectStore.getState().syncWithUser(firebaseUser.uid);
      } catch (err) {
        console.warn('Project sync error:', err);
      }
    } else {
      set({
        user: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
        authError: null,
      });
      useUIStore.getState().setAuthenticated(false);
      useProjectStore.getState().onUserSignedOut();
    }
  });

  return {
    user: null,
    profile: null,
    isLoading: false,
    isInitialized: false,
    authError: null,

    clearError: () => set({ authError: null }),

    signInWithGoogle: async () => {
      set({ isLoading: true, authError: null });
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const profile = await syncUserProfile(cred.user);
        set({ user: cred.user, profile, isLoading: false, authError: null });
        return cred.user;
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },

    signInWithEmail: async (email: string, pass: string) => {
      set({ isLoading: true, authError: null });
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        const profile = await syncUserProfile(cred.user);
        set({ user: cred.user, profile, isLoading: false, authError: null });
        return cred.user;
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },

    signUpWithEmail: async (fullName: string, email: string, pass: string) => {
      set({ isLoading: true, authError: null });
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        if (fullName.trim()) {
          try {
            await updateProfile(cred.user, { displayName: fullName.trim() });
          } catch (e) {}
        }
        try {
          await sendEmailVerification(cred.user);
        } catch (e) {}

        const profile = await syncUserProfile(cred.user);
        set({ user: cred.user, profile, isLoading: false, authError: null });
        return cred.user;
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },

    sendPasswordReset: async (email: string) => {
      set({ isLoading: true, authError: null });
      try {
        await sendPasswordResetEmail(auth, email.trim());
        set({ isLoading: false, authError: null });
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },

    resendVerification: async () => {
      const { user } = get();
      if (!user) throw new Error('No user is currently signed in');
      await sendEmailVerification(user);
    },

    signOut: async () => {
      set({ isLoading: true });
      try {
        await fbSignOut(auth);
      } finally {
        set({ user: null, profile: null, isLoading: false, authError: null });
        useUIStore.getState().setAuthenticated(false);
        useUIStore.getState().closeModal();
        useProjectStore.getState().onUserSignedOut();
      }
    },

    deleteAccount: async (password?: string) => {
      const targetUser = auth.currentUser || get().user;
      if (!targetUser) {
        throw new Error('No user is currently signed in.');
      }

      set({ isLoading: true, authError: null });
      const userId = targetUser.uid;

      try {
        // If password was provided for recent re-authentication
        if (password && targetUser.email) {
          const cred = EmailAuthProvider.credential(targetUser.email, password);
          await reauthenticateWithCredential(targetUser, cred);
        }

        // 1. Delete all Firestore projects owned by this user
        try {
          await deleteAllUserProjectsFromFirestore(userId);
        } catch (e) {
          console.warn('Error deleting user projects from Firestore:', e);
        }

        // 2. Delete the user profile document from Firestore
        try {
          await deleteUserProfileFromFirestore(userId);
        } catch (e) {
          console.warn('Error deleting user profile from Firestore:', e);
        }

        // 3. Delete the user from Firebase Auth
        await deleteUser(targetUser);

        // 4. Reset stores and state
        set({ user: null, profile: null, isLoading: false, authError: null });
        useUIStore.getState().setAuthenticated(false);
        useUIStore.getState().closeModal();
        useProjectStore.getState().onUserSignedOut();
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },

    reauthenticateWithGoogleAndDelete: async () => {
      const targetUser = auth.currentUser || get().user;
      if (!targetUser) {
        throw new Error('No user is currently signed in.');
      }

      set({ isLoading: true, authError: null });
      const userId = targetUser.uid;

      try {
        await reauthenticateWithPopup(targetUser, googleProvider);

        try {
          await deleteAllUserProjectsFromFirestore(userId);
        } catch (e) {
          console.warn('Error deleting user projects from Firestore:', e);
        }

        try {
          await deleteUserProfileFromFirestore(userId);
        } catch (e) {
          console.warn('Error deleting user profile from Firestore:', e);
        }

        await deleteUser(targetUser);

        set({ user: null, profile: null, isLoading: false, authError: null });
        useUIStore.getState().setAuthenticated(false);
        useUIStore.getState().closeModal();
        useProjectStore.getState().onUserSignedOut();
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        set({ isLoading: false, authError: errorMsg });
        throw new Error(errorMsg);
      }
    },
  };
});
