import { Progress } from "./types";

const STORAGE_KEY = "patternEnglishProgress";

const ALL_CHAPTERS = Array.from({ length: 100 }, (_, i) => i + 1);

const defaultProgress: Progress = {
  unlockedChapters: ALL_CHAPTERS,
  completedChapters: [],
  scores: {},
};

export function getProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultProgress;
    return JSON.parse(data) as Progress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function unlockNextChapter(currentChapterId: number, score: number): Progress {
  const progress = getProgress();
  progress.scores[currentChapterId] = Math.max(
    progress.scores[currentChapterId] ?? 0,
    score
  );

  if (!progress.completedChapters.includes(currentChapterId)) {
    progress.completedChapters.push(currentChapterId);
  }

  saveProgress(progress);
  return progress;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
