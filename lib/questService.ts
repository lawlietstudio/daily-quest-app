import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { DailyQuest, DailyProgress } from "@/types/quest";

const COLLECTION_NAME = "quests";
const PROGRESS_COLLECTION_NAME = "progress";

// Get all quests
export const getAllQuests = async (): Promise<DailyQuest[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("id", "asc"));
  const querySnapshot = await getDocs(q);
  const quests = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    firestoreId: doc.id,
  })) as DailyQuest[];
  
  // Sort by priority (ascending), then by ID
  // Default priority to 999 if missing so they appear at the end
  return quests.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999) || a.id - b.id);
};

// Subscribe to real-time updates
export const subscribeToQuests = (
  callback: (quests: DailyQuest[]) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("id", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const quests = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyQuest[];
    
    // Sort by priority (ascending), then by ID
    const sortedQuests = quests.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999) || a.id - b.id);
    callback(sortedQuests);
  });
};

// Create a new quest
export const createQuest = async (
  quest: Omit<DailyQuest, "firestoreId">
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), quest);
  return docRef.id;
};

// Update a quest
export const updateQuest = async (
  firestoreId: string,
  quest: Partial<DailyQuest>
): Promise<void> => {
  const questRef = doc(db, COLLECTION_NAME, firestoreId);
  await updateDoc(questRef, quest);
};

// Delete a quest
export const deleteQuest = async (firestoreId: string): Promise<void> => {
  const questRef = doc(db, COLLECTION_NAME, firestoreId);
  await deleteDoc(questRef);
};

// Get the next available ID
export const getNextQuestId = async (): Promise<number> => {
  const quests = await getAllQuests();
  if (quests.length === 0) return 1;
  const maxId = Math.max(...quests.map((q) => q.id));
  return maxId + 1;
};

// --- Progress Operations ---

// Subscribe to progress for a specific date
export const subscribeToProgress = (
  date: string,
  callback: (progress: DailyProgress[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, PROGRESS_COLLECTION_NAME),
    where("date", "==", date)
  );
  return onSnapshot(q, (querySnapshot) => {
    const progress = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyProgress[];
    callback(progress);
  });
};

// Subscribe to progress for a date range
export const subscribeToMonthlyProgress = (
  startDate: string,
  endDate: string,
  callback: (progress: DailyProgress[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, PROGRESS_COLLECTION_NAME),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  return onSnapshot(q, (querySnapshot) => {
    const progress = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyProgress[];
    callback(progress);
  });
};

// Get all progress (helper for ID generation)
const getAllProgress = async (): Promise<DailyProgress[]> => {
  const querySnapshot = await getDocs(collection(db, PROGRESS_COLLECTION_NAME));
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    firestoreId: doc.id,
  })) as DailyProgress[];
};

// Get next progress ID
export const getNextProgressId = async (): Promise<number> => {
  // Note: In a high-concurrency app, this isn't safe. 
  // But for a personal app, it's acceptable.
  // A better approach would be using Firestore transaction or a counter document.
  const progress = await getAllProgress();
  if (progress.length === 0) return 1;
  const maxId = Math.max(...progress.map((p) => p.id));
  return maxId + 1;
};

// Update or Create Progress
export const updateProgress = async (
  questId: number,
  date: string,
  quantity: number,
  existingProgress?: DailyProgress
): Promise<void> => {
  if (existingProgress && existingProgress.firestoreId) {
    // Update existing
    const progressRef = doc(db, PROGRESS_COLLECTION_NAME, existingProgress.firestoreId);
    await updateDoc(progressRef, { quantity });
  } else {
    // Create new
    const nextId = await getNextProgressId();
    const newProgress: Omit<DailyProgress, "firestoreId"> = {
      id: nextId,
      questId,
      date,
      quantity,
    };
    await addDoc(collection(db, PROGRESS_COLLECTION_NAME), newProgress);
  }
};

