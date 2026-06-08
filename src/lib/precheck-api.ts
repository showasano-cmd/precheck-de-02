// Client for the PreCheck DE GAS API.
// All calls are GET only with URLSearchParams; responses are parsed with
// response.text() + JSON.parse() to handle GAS quirks.

export const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzQX34XoM9xdxel9zSocfiEZ4YOMYmUbuxZDfcBTgfRDh8CmtWMtwAuOT6UsfrvPXjw1g/exec";

export const TEST_ID = "precheck_de_lite_v2";

export const GITHUB_ASSET_BASE =
  "https://github.com/showasano-cmd/precheck-de-02/raw/main/public";

export type QuestionType = "reading" | "listening";

export interface Question {
  question_id: string;
  question_number: number;
  question_type?: QuestionType;
  section?: string;
  question_text: string;
  passage_text?: string;
  audio_url?: string;
  audio_file?: string;
  display_rule?: "after_audio" | string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d?: string;
  points?: number;
}

export interface FetchQuestionsResponse {
  status?: string;
  ok?: boolean;
  error?: string;
  questions: Question[];
  max_score?: number;
  test_id?: string;
}

export interface SubmitAnswer {
  question_id: string;
  answer: "A" | "B" | "C" | "D";
  audio_played_flag: boolean;
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

export async function fetchQuestions(): Promise<FetchQuestionsResponse> {
  const params = new URLSearchParams({
    action: "getQuestions",
    test_id: TEST_ID,
  });
  const url = `${GAS_ENDPOINT}?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    mode: "cors",
  });
  const text = await response.text();
  const data = JSON.parse(text) as FetchQuestionsResponse;
  console.log("RAW API RESPONSE:", JSON.stringify(data));
  return data;
}

export async function submitAnswers(
  examineeName: string,
  answersArray: SubmitAnswer[],
): Promise<SubmitResponse> {
  const params = new URLSearchParams({
    action: "submitAnswers",
    test_id: TEST_ID,
    examinee_id: examineeName,
    answers_json: JSON.stringify(answersArray),
  });
  const url = `${GAS_ENDPOINT}?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    mode: "cors",
  });
  const text = await response.text();
  const data = JSON.parse(text) as SubmitResponse;
  console.log("SUBMIT RESPONSE:", JSON.stringify(data));
  return data;
}

export function getAudioUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/audio/")) return GITHUB_ASSET_BASE + url;
  return url;
}

// Backwards-compatible alias used by the UI.
export const resolveAudioUrl = getAudioUrl;

export interface Band {
  label: string;
  message: string;
  color: string;
  bg: string;
}

export function getBand(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 13) return "A";
  if (score >= 11) return "B";
  if (score >= 8) return "C";
  if (score >= 5) return "D";
  return "E";
}

export function getFeedback(band: string): string {
  switch (band) {
    case "A":
      return "Kết quả xuất sắc! Bạn đã có đủ năng lực trình độ D-E.";
    case "B":
      return "Rất tốt! Chỉ cần một chút nữa là bạn sẽ đạt trình độ cao hơn.";
    case "C":
      return "Bạn đã nắm được kiến thức cơ bản. Hãy tiếp tục luyện tập nhé!";
    case "D":
      return "Bạn cần ôn lại kiến thức cơ bản. Hãy bắt đầu từ ngữ pháp căn bản.";
    case "E":
      return "Hãy bắt đầu từ những điều cơ bản. Chúng ta cùng cố gắng nhé!";
    default:
      return "";
  }
}

const BAND_STYLES: Record<string, { color: string; bg: string }> = {
  A: { color: "text-emerald-700", bg: "bg-emerald-50" },
  B: { color: "text-sky-700", bg: "bg-sky-50" },
  C: { color: "text-blue-700", bg: "bg-blue-50" },
  D: { color: "text-amber-700", bg: "bg-amber-50" },
  E: { color: "text-rose-700", bg: "bg-rose-50" },
};

export function getBandInfo(score: number): Band {
  const b = getBand(score);
  return {
    label: `Band ${b}`,
    message: getFeedback(b),
    color: BAND_STYLES[b].color,
    bg: BAND_STYLES[b].bg,
  };
}
