export interface DailyQuest {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  priority: number;
  firestoreId?: string; // Firestore document ID
}

export interface DailyProgress {
  id: number;
  questId: number;
  date: string; // YYYY-MM-DD
  quantity: number;
  firestoreId?: string;
}
