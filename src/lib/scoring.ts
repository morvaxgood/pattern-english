export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u2032\u0060\u00B4\u2027]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2014\u2013\u2012\u2015]/g, "-")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
