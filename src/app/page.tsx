"use client";

import { useEffect, useState } from "react";
import { Chapter, ChaptersData, Progress } from "@/lib/types";
import { getProgress, resetProgress } from "@/lib/progress";
import Link from "next/link";

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    fetch("/chapters.json")
      .then((res) => res.json())
      .then((data: ChaptersData) => setChapters(data.chapters));
    setProgress(getProgress());
  }, []);

  if (!progress || chapters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const completedCount = progress.completedChapters.length;
  const totalCount = chapters.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount && totalCount > 0;

  if (allCompleted) {
    return <CompletionScreen progress={progress} totalCount={totalCount} />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pattern English</h1>
        <p className="text-slate-500 mb-4">영어 패턴 문장으로 B1에서 B2+까지</p>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">전체 진행률</span>
            <span className="font-semibold text-blue-600">
              {completedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-3">
        {chapters.map((chapter) => {
          const isUnlocked = progress.unlockedChapters.includes(chapter.id);
          const isCompleted = progress.completedChapters.includes(chapter.id);
          const score = progress.scores[chapter.id];

          return (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              score={score}
            />
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => {
            if (confirm("모든 진행 상황이 초기화됩니다. 계속하시겠습니까?")) {
              resetProgress();
              setProgress(getProgress());
            }
          }}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          진행 상황 초기화
        </button>
      </div>
    </main>
  );
}

function ChapterCard({
  chapter,
  isUnlocked,
  isCompleted,
  score,
}: {
  chapter: Chapter;
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;
}) {
  const levelColors: Record<string, string> = {
    B1: "bg-green-100 text-green-700",
    "B1-B2": "bg-yellow-100 text-yellow-700",
    B2: "bg-orange-100 text-orange-700",
    "B2+": "bg-red-100 text-red-700",
  };

  if (!isUnlocked) {
    return (
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Ch.{chapter.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[chapter.level] ?? "bg-slate-100 text-slate-600"}`}>
                {chapter.level}
              </span>
            </div>
            <p className="font-medium text-slate-400">{chapter.title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/chapter/${chapter.id}`}>
      <div className={`rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer ${
        isCompleted
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-slate-200 hover:border-blue-300"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isCompleted ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-sm font-bold">{chapter.id}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Ch.{chapter.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[chapter.level] ?? "bg-slate-100 text-slate-600"}`}>
                {chapter.level}
              </span>
              {score !== undefined && (
                <span className={`text-xs font-semibold ${score >= 80 ? "text-blue-600" : "text-orange-500"}`}>
                  {score}점
                </span>
              )}
            </div>
            <p className="font-medium text-slate-800">{chapter.title}</p>
            <p className="text-sm text-slate-500">{chapter.description}</p>
          </div>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function CompletionScreen({ progress, totalCount }: { progress: Progress; totalCount: number }) {
  const totalScore = Object.values(progress.scores).reduce((sum, s) => sum + s, 0);
  const avgScore = Math.round(totalScore / totalCount);
  const perfectCount = Object.values(progress.scores).filter((s) => s === 100).length;

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">축하합니다!</h1>
      <p className="text-lg text-slate-600 mb-8">
        100개 챕터를 모두 클리어했습니다!
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">전체 성적 요약</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-slate-500">완료 챕터</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{avgScore}점</div>
            <div className="text-sm text-slate-500">평균 점수</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{perfectCount}</div>
            <div className="text-sm text-slate-500">만점 챕터</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          resetProgress();
          window.location.reload();
        }}
        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        처음부터 다시 도전하기
      </button>
    </main>
  );
}
