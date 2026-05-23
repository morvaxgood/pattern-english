"use client";

import { useEffect, useState, useRef, use } from "react";
import { Chapter, ChaptersData, Progress } from "@/lib/types";
import { getProgress, unlockNextChapter } from "@/lib/progress";
import { checkAnswer } from "@/lib/scoring";
import Link from "next/link";

type Phase = "intro" | "test" | "result";

interface AnswerResult {
  questionIndex: number;
  ko: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export default function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chapterId = parseInt(id, 10);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/chapters.json")
      .then((res) => res.json())
      .then((data: ChaptersData) => {
        const ch = data.chapters.find((c) => c.id === chapterId);
        setChapter(ch ?? null);
      });
    setProgress(getProgress());
  }, [chapterId]);

  if (!chapter || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isUnlocked = progress.unlockedChapters.includes(chapterId);
  if (!isUnlocked) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">잠긴 챕터</h1>
        <p className="text-slate-500 mb-6">이전 챕터를 먼저 클리어하세요.</p>
        <Link href="/" className="text-blue-600 font-semibold hover:underline">
          홈으로 돌아가기
        </Link>
      </main>
    );
  }

  if (phase === "intro") {
    return (
      <IntroScreen
        chapter={chapter}
        onStart={() => {
          setPhase("test");
          setCurrentQ(0);
          setResults([]);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />
    );
  }

  if (phase === "result") {
    const score = Math.round(
      (results.filter((r) => r.isCorrect).length / results.length) * 100
    );
    const newProgress = unlockNextChapter(chapterId, score);

    return (
      <ResultScreen
        chapter={chapter}
        results={results}
        score={score}
        isLastChapter={chapterId === 100}
        onRetry={() => {
          setPhase("intro");
          setCurrentQ(0);
          setResults([]);
          setShowFeedback(false);
          setLastResult(null);
          setUserAnswer("");
        }}
      />
    );
  }

  const question = chapter.questions[currentQ];
  const totalQuestions = chapter.questions.length;

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = checkAnswer(userAnswer, question.answer);
    const result: AnswerResult = {
      questionIndex: currentQ,
      ko: question.ko,
      correctAnswer: question.answer,
      userAnswer: userAnswer.trim(),
      isCorrect,
    };

    setLastResult(result);
    setShowFeedback(true);
    setResults((prev) => [...prev, result]);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setLastResult(null);
    setUserAnswer("");

    if (currentQ + 1 < totalQuestions) {
      setCurrentQ((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setPhase("result");
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm text-slate-500">
          Ch.{chapter.id} &middot; {chapter.title}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {currentQ + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + (showFeedback ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Korean sentence */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
        <p className="text-sm text-slate-400 mb-2">이 문장을 영어로 쓰세요</p>
        <p className="text-xl font-medium text-slate-900 leading-relaxed">{question.ko}</p>
      </div>

      {/* Input */}
      {!showFeedback ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="영어로 입력하세요..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg mb-4 text-slate-900"
          />
          <button
            type="submit"
            disabled={!userAnswer.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            제출
          </button>
        </form>
      ) : (
        <div>
          {/* Feedback */}
          <div className={`rounded-2xl p-5 mb-4 border ${
            lastResult?.isCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {lastResult?.isCorrect ? (
                <>
                  <span className="text-2xl">⭕</span>
                  <span className="font-bold text-green-700 text-lg">정답!</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">❌</span>
                  <span className="font-bold text-red-700 text-lg">오답</span>
                </>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-slate-500">내 답변: </span>
                <span className={`font-medium ${lastResult?.isCorrect ? "text-green-700" : "text-red-600 line-through"}`}>
                  {lastResult?.userAnswer}
                </span>
              </div>
              {!lastResult?.isCorrect && (
                <div>
                  <span className="text-sm text-slate-500">정답: </span>
                  <span className="font-medium text-green-700">{lastResult?.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNext}
            autoFocus
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {currentQ + 1 < totalQuestions ? "다음 문제" : "결과 보기"}
          </button>
        </div>
      )}
    </main>
  );
}

function IntroScreen({
  chapter,
  onStart,
}: {
  chapter: Chapter;
  onStart: () => void;
}) {
  const levelColors: Record<string, string> = {
    B1: "bg-green-100 text-green-700",
    "B1-B2": "bg-yellow-100 text-yellow-700",
    B2: "bg-orange-100 text-orange-700",
    "B2+": "bg-red-100 text-red-700",
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        홈으로
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-slate-500">Chapter {chapter.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[chapter.level] ?? "bg-slate-100 text-slate-600"}`}>
            {chapter.level}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{chapter.title}</h1>
        <p className="text-lg text-slate-600">{chapter.description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">예문 미리보기</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {chapter.questions.map((q, i) => (
            <div key={q.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-slate-900 font-medium mb-1">{q.answer}</p>
                  <p className="text-sm text-slate-500">{q.ko}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
      >
        테스트 시작
      </button>
    </main>
  );
}

function ResultScreen({
  chapter,
  results,
  score,
  isLastChapter,
  onRetry,
}: {
  chapter: Chapter;
  results: AnswerResult[];
  score: number;
  isLastChapter: boolean;
  onRetry: () => void;
}) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const wrongResults = results.filter((r) => !r.isCorrect);

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{score === 100 ? "🎉" : "👏"}</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          테스트 완료!
        </h1>
        <p className="text-slate-500">
          Ch.{chapter.id} &middot; {chapter.title}
        </p>
      </div>

      {/* Score */}
      <div className="rounded-2xl p-6 text-center mb-6 border bg-blue-50 border-blue-200">
        <div className="text-4xl font-bold mb-1 text-blue-600">
          {score}점
        </div>
        <div className="text-sm text-slate-500">
          {correctCount} / {results.length} 정답
        </div>
      </div>

      {/* Wrong answers review */}
      {wrongResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">틀린 문제 복습</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {wrongResults.map((r, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-sm text-slate-500 mb-1">{r.ko}</p>
                <p className="text-red-500 line-through text-sm mb-1">{r.userAnswer}</p>
                <p className="text-green-700 font-medium">{r.correctAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!isLastChapter && (
          <Link
            href={`/chapter/${chapter.id + 1}`}
            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            다음 챕터로
          </Link>
        )}
        {isLastChapter && (
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            홈으로
          </Link>
        )}
        <button
          onClick={onRetry}
          className="w-full text-center py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          다시 풀기
        </button>
        <Link
          href="/"
          className="block w-full text-center py-3 rounded-xl font-semibold text-slate-400 hover:bg-slate-100 transition-colors"
        >
          챕터 목록
        </Link>
      </div>
    </main>
  );
}
