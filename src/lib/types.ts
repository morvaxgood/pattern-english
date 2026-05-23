export interface Question {
  id: string;
  ko: string;
  answer: string;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  level: string;
  questions: Question[];
}

export interface ChaptersData {
  chapters: Chapter[];
}

export interface Progress {
  unlockedChapters: number[];
  completedChapters: number[];
  scores: Record<number, number>;
}
