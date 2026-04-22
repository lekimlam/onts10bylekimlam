export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  xp: number;
  streak: number;
  lastActive?: any;
  dailyGoal: number;
  level: number;
}

export interface VocabularyCard {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  topic: string;
  courseId: string;
  level: number; // 0 for new, 1...n for master levels
  nextReview?: any;
  lastReviewed?: any;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalWords: number;
}
