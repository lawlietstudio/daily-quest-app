export type QuadrantType = 
  | 'urgent-important' 
  | 'not-urgent-important' 
  | 'urgent-not-important' 
  | 'not-urgent-not-important';

export interface EisenhowerItem {
  id: string; // will be Firestore document ID
  title: string;
  quadrant: QuadrantType;
  completed: boolean;
  order: number;
  createdAt: number;
}
