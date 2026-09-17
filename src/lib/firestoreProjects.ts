import {
  db,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  OperationType,
  handleFirestoreError,
} from './firebase';
import { Project } from '../types';
import { isQuotaExceeded, setQuotaExceeded } from './firebaseQuota';

/**
 * Saves or updates a project document in Firestore.
 */
export async function syncProjectToFirestore(project: Project, userId: string): Promise<void> {
  if (isQuotaExceeded || !userId || !project?.id) return;
  const path = `projects/${project.id}`;
  try {
    const projRef = doc(db, 'projects', project.id);
    const elementsJson = JSON.stringify(project.elements || {});
    const projectData = {
      id: project.id,
      userId: userId,
      ownerId: userId,
      name: project.name || 'Untitled Project',
      projectType: project.projectType || 'Website',
      previewType: project.previewType || 'desktop',
      description: project.description || '',
      techStack: project.techStack || [],
      projectStatus: project.projectStatus || 'Planning',
      githubUrl: project.githubUrl || '',
      liveDemoUrl: project.liveDemoUrl || '',
      activePageId: project.activePageId || 'page-1',
      pages: project.pages || [{ id: 'page-1', name: 'Page 1 — Main Canvas' }],
      elementsJson: elementsJson,
      status: project.status || 'active',
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(projRef, projectData, { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      console.warn('Firestore quota exceeded. Stopping cloud sync for this session.');
      setQuotaExceeded(true);
      return;
    }
    console.warn('Error saving project to Firestore:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

/**
 * Fetches all projects owned by the authenticated user from Firestore.
 */
export async function fetchUserProjectsFromFirestore(userId: string): Promise<Project[]> {
  if (!userId) return [];
  const path = 'projects';
  try {
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const projects: Project[] = [];
    snap.forEach((d) => {
      const data = d.data();
      let elements = {};
      if (data.elementsJson) {
        try {
          elements = JSON.parse(data.elementsJson);
        } catch (e) {
          elements = {};
        }
      } else if (data.elements && typeof data.elements === 'object') {
        elements = data.elements;
      }
      projects.push({
        id: data.id,
        name: data.name,
        ownerId: data.ownerId || data.userId,
        elements,
        pages: data.pages || [{ id: 'page-1', name: 'Page 1 — Main Canvas' }],
        activePageId: data.activePageId || 'page-1',
        previewType: data.previewType || 'desktop',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        projectType: data.projectType,
        description: data.description,
        techStack: data.techStack,
        projectStatus: data.projectStatus,
        status: data.status || 'active',
        githubUrl: data.githubUrl,
        liveDemoUrl: data.liveDemoUrl,
      });
    });
    return projects;
  } catch (err: any) {
    console.warn('Error fetching user projects from Firestore:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
    return [];
  }
}

/**
 * Deletes a project document from Firestore.
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  if (!projectId) return;
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err: any) {
    console.warn('Error deleting project from Firestore:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

/**
 * Deletes all projects owned by a user from Firestore.
 */
export async function deleteAllUserProjectsFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err: any) {
    console.warn('Error deleting all user projects from Firestore:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.DELETE, 'projects');
    }
  }
}

/**
 * Deletes user profile document from Firestore.
 */
export async function deleteUserProfileFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err: any) {
    console.warn('Error deleting user profile from Firestore:', err);
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

