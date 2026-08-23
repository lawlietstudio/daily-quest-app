import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Motto } from "@/types/motto";

const COLLECTION_NAME = "mottos";

export const subscribeToMottos = (
  callback: (mottos: Motto[]) => void
): Unsubscribe => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const mottos = querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    })) as Motto[];
    callback(mottos);
  });
};

export const createMotto = async (text: string): Promise<void> => {
  await addDoc(collection(db, COLLECTION_NAME), {
    text,
    order: Date.now(),
    createdAt: Date.now(),
  });
};

export const updateMotto = async (
  id: string,
  updates: Partial<Motto>
): Promise<void> => {
  const mottoRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(mottoRef, updates);
};

export const deleteMotto = async (id: string): Promise<void> => {
  const mottoRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(mottoRef);
};

export const updateMottoOrder = async (mottos: Motto[]): Promise<void> => {
  const batch = writeBatch(db);
  mottos.forEach((motto, index) => {
    const mottoRef = doc(db, COLLECTION_NAME, motto.id);
    batch.update(mottoRef, { order: index });
  });
  await batch.commit();
};
