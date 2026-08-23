import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { EisenhowerItem, QuadrantType } from "@/types/eisenhower";

const COLLECTION_NAME = "eisenhower";

export const subscribeToEisenhowerItems = (
  callback: (items: EisenhowerItem[]) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as EisenhowerItem[];
    callback(items);
  });
};

export const addEisenhowerItem = async (
  title: string,
  quadrant: QuadrantType
) => {
  const newItem = {
    title,
    quadrant,
    completed: false,
    order: Date.now(), // timestamp as initial order
    createdAt: Date.now(),
  };
  await addDoc(collection(db, COLLECTION_NAME), newItem);
};

export const updateEisenhowerItem = async (
  id: string,
  updates: Partial<EisenhowerItem>
) => {
  const itemRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(itemRef, updates);
};

export const deleteEisenhowerItem = async (id: string) => {
  const itemRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(itemRef);
};

export const updateEisenhowerOrder = async (items: EisenhowerItem[]) => {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const itemRef = doc(db, COLLECTION_NAME, item.id);
    batch.update(itemRef, { order: item.order, quadrant: item.quadrant });
  });
  await batch.commit();
};
