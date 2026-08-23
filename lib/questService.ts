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

// Simple in-memory tracker to avoid calling console.time with the same label twice
const __timers = new Set<string>();
function startTimerOnce(label: string) {
  if (__timers.has(label)) {
    console.warn(`Timer '${label}' already exists`);
    return false;
  }
  __timers.add(label);
  console.time(label);
  return true;
}
function endTimerIfExists(label: string) {
  if (!__timers.has(label)) return false;
  console.timeEnd(label);
  __timers.delete(label);
  return true;
}

// Get all quests
export const getAllQuests = async (): Promise<DailyQuest[]> => {
  startTimerOnce("getAllQuests");
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
  const timerLabel = `subscribeToQuests.firstSnapshot:${Date.now()}`;
  startTimerOnce(timerLabel);
  let first = true;
  console.log("subscribeToQuests: subscribing");
  const unsub = onSnapshot(q, (querySnapshot) => {
    if (first) {
      endTimerIfExists(timerLabel);
      first = false;
    }
    const quests = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyQuest[];
    
    // Sort by priority (ascending), then by ID
    const sortedQuests = quests.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999) || a.id - b.id);
    callback(sortedQuests);
  });
  return () => {
    console.log("subscribeToQuests: unsubscribing");
    unsub();
  };
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
  const timerLabel = `subscribeToProgress.firstSnapshot:${date}:${Date.now()}`;
  startTimerOnce(timerLabel);
  let first = true;
  console.log(`subscribeToProgress: subscribing for ${date}`);
  const unsub = onSnapshot(q, (querySnapshot) => {
    if (first) {
      endTimerIfExists(timerLabel);
      first = false;
    }
    const progress = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyProgress[];
    callback(progress);
  });
  return () => {
    console.log(`subscribeToProgress: unsubscribing for ${date}`);
    unsub();
  };
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
  const timerLabel = `subscribeToMonthlyProgress.firstSnapshot:${startDate}:${endDate}:${Date.now()}`;
  startTimerOnce(timerLabel);
  let first = true;
  console.log(`subscribeToMonthlyProgress: subscribing ${startDate} -> ${endDate}`);
  const unsub = onSnapshot(q, (querySnapshot) => {
    if (first) {
      endTimerIfExists(timerLabel);
      first = false;
    }
    const progress = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestoreId: doc.id,
    })) as DailyProgress[];
    callback(progress);
  });
  return () => {
    console.log(`subscribeToMonthlyProgress: unsubscribing ${startDate} -> ${endDate}`);
    unsub();
  };
};

// Get all progress (helper for ID generation)
const getAllProgress = async (): Promise<DailyProgress[]> => {
  const label = `getAllProgress:${Date.now()}`;
  startTimerOnce(label);
  const querySnapshot = await getDocs(collection(db, PROGRESS_COLLECTION_NAME));
  const res = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    firestoreId: doc.id,
  })) as DailyProgress[];
  endTimerIfExists(label);
  return res;
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

