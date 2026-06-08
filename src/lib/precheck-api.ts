// Client for the PreCheck DE GAS API.
// GAS web apps are CORS-friendly when requests use simple content types
// (text/plain) so the browser does not send a preflight.

export const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzQX34XoM9xdxel9zSocfiEZ4YOMYmUbuxZDfcBTgfRDh8CmtWMtwAuOT6UsfrvPXjw1g/exec";

export const TEST_ID = "precheck_de_lite_v2";

export const AUDIO_BASE_URL =
  "https://github.com/showasano-cmd/precheck-de-02/raw/main/public";

export type QuestionType = "reading" | "listening";

export interface Question {
  question_id: string;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  passage_text?: string;
  audio_file?: string;
  display_rule?: "after_audio" | string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d?: string;
  points?: number;
}

export interface FetchQuestionsResponse {
  ok?: boolean;
  questions: Question[];
  max_score?: number;
  test_id?: string;
}

export interface SubmitAnswer {
  question_id: string;
  selected: "a" | "b" | "c" | "d";
}

export interface SubmitPayload {
  test_id: string;
  name: string;
  answers: SubmitAnswer[];
}

export interface SubmitResponse {
  ok?: boolean;
  total_score: number;
  max_score: number;
  correct_count?: number;
  details?: Array<{
    question_id: string;
    correct: boolean;
    correct_answer?: string;
  }>;
}

async function gasRequest<T>(
  params: Record<string, string>,
  body?: unknown,
): Promise<T> {
  const url = new URL(GAS_ENDPOINT);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const init: RequestInit = body
    ? {
        method: "POST",
        // text/plain avoids the CORS preflight on Apps Script web apps.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
      }
    : { method: "GET" };

  const res = await fetch(url.toString(), init);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from GAS: ${text.slice(0, 200)}`);
  }
}

export async function fetchQuestions(): Promise<FetchQuestionsResponse> {
  return gasRequest<FetchQuestionsResponse>({
    action: "get_questions",
    test_id: TEST_ID,
  });
}

export async function submitAnswers(
  name: string,
  answers: SubmitAnswer[],
): Promise<SubmitResponse> {
  return gasRequest<SubmitResponse>(
    { action: "submit", test_id: TEST_ID },
    { test_id: TEST_ID, name, answers } satisfies SubmitPayload,
  );
}

export function resolveAudioUrl(file: string): string {
  if (/^https?:\/\//i.test(file)) return file;
  const clean = file.replace(/^\/+/, "");
  return `${AUDIO_BASE_URL}/${clean}`;
}

// Band rules (client-side). Tune as needed.
export interface Band {
  label: string;
  message: string;
  color: string;
  bg: string;
}

export function calculateBand(score: number, max: number): Band {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 85)
    return {
      label: "特A級レベル",
      message: "素晴らしい結果です！J.TEST DE 上位合格が十分狙えます。",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    };
  if (pct >= 70)
    return {
      label: "A級レベル",
      message: "とても良い成績です。本番でも十分通用する力があります。",
      color: "text-sky-700",
      bg: "bg-sky-50",
    };
  if (pct >= 55)
    return {
      label: "準A級レベル",
      message: "あと一歩。弱点を復習すれば合格圏内です。",
      color: "text-blue-700",
      bg: "bg-blue-50",
    };
  if (pct >= 40)
    return {
      label: "B級レベル",
      message: "基礎は身についています。語彙と聴解を強化しましょう。",
      color: "text-amber-700",
      bg: "bg-amber-50",
    };
  return {
    label: "C級レベル",
    message: "もう少し学習が必要です。基礎から固めていきましょう。",
    color: "text-rose-700",
    bg: "bg-rose-50",
  };
}
