import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  fetchQuestions,
  submitAnswers,
  resolveAudioUrl,
  getBandInfo,
  type Question,
  type SubmitResponse,
  type SubmitAnswer,
} from "@/lib/precheck-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "J.TEST プレチェック DE" },
      { name: "description", content: "J.TEST DE 実力確認のための無料プレチェックテスト。" },
      { property: "og:title", content: "J.TEST プレチェック DE" },
      { property: "og:description", content: "J.TEST DE 実力確認のための無料プレチェックテスト。" },
    ],
  }),
  component: PreCheckApp,
});

type Screen = "start" | "test" | "result";
type Choice = "A" | "B" | "C" | "D";

function PreCheckApp() {
  const [screen, setScreen] = useState<Screen>("start");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [audioPlayedMap, setAudioPlayedMap] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!name.trim()) {
      setError("お名前を入力してください");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchQuestions();
      if (data.status !== "ok" || !data.questions || data.questions.length === 0) {
        setError(
          "問題の取得に失敗しました: " +
            (data.error || "問題が見つかりませんでした。"),
        );
        return;
      }
      const qs = data.questions
        .slice()
        .sort((a, b) => a.question_number - b.question_number);
      setQuestions(qs);
      setAnswers({});
      setAudioPlayedMap({});
      setScreen("test");
    } catch (e) {
      setError(e instanceof Error ? `問題の取得に失敗しました: ${e.message}` : "問題の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: SubmitAnswer[] = questions.map((q) => ({
        question_id: q.question_id,
        answer: (answers[q.question_id] ?? "A") as "A" | "B" | "C" | "D",
        audio_played_flag: !!audioPlayedMap[q.question_id],
      }));
      const res = await submitAnswers(name.trim(), payload);
      setResult(res);
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? `送信に失敗しました: ${e.message}` : "送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setScreen("start");
    setAnswers({});
    setAudioPlayedMap({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {screen === "start" && (
            <StartScreen
              key="start"
              name={name}
              setName={setName}
              onStart={handleStart}
              loading={loading}
              error={error}
            />
          )}
          {screen === "test" && (
            <TestScreen
              key="test"
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              audioPlayedMap={audioPlayedMap}
              setAudioPlayedMap={setAudioPlayedMap}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
          {screen === "result" && result && (
            <ResultScreen
              key="result"
              name={name}
              result={result}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppHeader() {
  return (
    <header className="w-full bg-[#0b1e3b] text-white">
      <div className="mx-auto max-w-xl px-4 py-4 text-center">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
          J.TEST PreCheck <span className="text-emerald-400">DE</span>
        </h1>
      </div>
    </header>
  );
}

/* ---------- Start Screen ---------- */

function StartScreen({
  name, setName, onStart, loading, error,
}: {
  name: string;
  setName: (v: string) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[80vh] flex-col justify-center"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-2xl font-extrabold">J</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          J.TEST PreCheck <span className="text-emerald-500">DE</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground">Kiểm tra trình độ tiếng Nhật</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cấp độ D-E (tương đương JLPT N3–N4) — 15 câu hỏi
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
          Họ và tên của bạn <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          autoComplete="name"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          onClick={onStart}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              Bắt đầu
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-xs text-center text-muted-foreground">© PreCheck DE02</p>
    </motion.div>
  );
}

/* ---------- Test Screen ---------- */

function TestScreen({
  questions, answers, setAnswers, audioPlayedMap, setAudioPlayedMap, onSubmit, loading, error,
}: {
  questions: Question[];
  answers: Record<string, Choice>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Choice>>>;
  audioPlayedMap: Record<string, boolean>;
  setAudioPlayedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const selectedAnswer = answers[currentQuestion.question_id] ?? null;
  const hasPlayed = !!audioPlayedMap[currentQuestion.question_id];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  const resolvedAudioUrl = resolveAudioUrl(currentQuestion.audio_url || "");

  const choices = [
    { key: "A" as Choice, value: currentQuestion.choice_a },
    { key: "B" as Choice, value: currentQuestion.choice_b },
    { key: "C" as Choice, value: currentQuestion.choice_c },
    { key: "D" as Choice, value: currentQuestion.choice_d },
  ].filter((c) => c.value && c.value.trim() !== "");

  const showChoices =
    currentQuestion.display_rule === "immediate" ||
    currentQuestion.section !== "listening" ||
    !resolvedAudioUrl ||
    hasPlayed;

  const setSelectedAnswer = (key: Choice) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: key }));
  };

  const setHasPlayed = () => {
    setAudioPlayedMap((prev) => ({ ...prev, [currentQuestion.question_id]: true }));
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Progress */}
      <div className="text-sm text-gray-500 mb-2">
        Câu {currentIndex + 1} / {total}
      </div>
      <div className="w-full bg-gray-200 rounded h-2 mb-4">
        <div
          className="bg-green-700 h-2 rounded transition-all"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Passage */}
      {currentQuestion.passage_text &&
        currentQuestion.passage_text.trim() !== "" && (
          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-base leading-relaxed whitespace-pre-wrap">
            {currentQuestion.passage_text}
          </div>
        )}

      {/* Question text */}
      <p className="text-base font-medium mb-4 whitespace-pre-wrap">
        {currentQuestion.question_text}
      </p>

      {/* Audio player */}
      {currentQuestion.section === "listening" && resolvedAudioUrl !== "" && (
        <div className="mb-4">
          <audio
            controls
            controlsList="nodownload"
            onPlay={() => setHasPlayed()}
            src={resolvedAudioUrl}
            className="w-full"
          >
            お使いのブラウザは音声再生に対応していません。
          </audio>
          {!hasPlayed && (
            <p className="text-gray-400 text-xs mt-1 text-center">
              ▶ 音声を再生すると選択肢が表示されます
            </p>
          )}
        </div>
      )}

      {/* Choices */}
      {showChoices && (
        <div className="space-y-3">
          {choices.map((choice) => (
            <button
              key={choice.key}
              onClick={() => setSelectedAnswer(choice.key)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-base transition-colors flex items-center gap-3 ${
                selectedAnswer === choice.key
                  ? "bg-green-50 text-gray-900 border-green-500"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  selectedAnswer === choice.key
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {choice.key}
              </span>
              <span className="flex-1">{choice.value}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Next / Submit */}
      {selectedAnswer && (
        <button
          onClick={handleNext}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-lg bg-green-700 text-white font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang gửi...
            </>
          ) : isLast ? (
            <>
              Nộp bài
              <CheckCircle2 className="h-5 w-5" />
            </>
          ) : (
            <>
              Câu tiếp theo
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ---------- Result Screen ---------- */

function ResultScreen({
  name, result, onRestart,
}: {
  name: string;
  result: SubmitResponse;
  onRestart: () => void;
}) {
  const band = useMemo(() => getBandInfo(result.total_score), [result]);
  const pct = useMemo(
    () => (result.max_score > 0 ? Math.round((result.total_score / result.max_score) * 100) : 0),
    [result],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${band.bg}`}
        >
          <CheckCircle2 className={`h-10 w-10 ${band.color}`} />
        </motion.div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-foreground"
          style={{ fontFamily: "'Inter', 'Noto Sans', 'Segoe UI', sans-serif" }}
        >
          Kết quả của {name}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center"
      >
        <div className="text-sm font-semibold text-muted-foreground mb-2">Điểm số</div>
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-5xl sm:text-6xl font-extrabold text-foreground tabular-nums">
            {result.total_score}
          </span>
          <span className="text-2xl font-bold text-muted-foreground">/ {result.max_score}</span>
          <span className="text-2xl font-bold text-muted-foreground">điểm</span>
        </div>
        <div className="text-sm text-muted-foreground">Tỷ lệ đúng {pct}%</div>

        <div className="my-6 h-px bg-border" />

        <div className="text-sm font-semibold text-muted-foreground mb-2">Xếp loại</div>
        <div className={`inline-block rounded-full px-5 py-2 text-lg font-extrabold ${band.bg} ${band.color}`}>
          {band.label}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">{band.message}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 space-y-3"
      >
        <a
          href="https://jtest.com.vn/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
          style={{ fontFamily: "'Inter', 'Noto Sans', 'Segoe UI', sans-serif" }}
        >
          Truy cập trang J.TEST chính thức
          <ExternalLink className="h-5 w-5" />
        </a>
        <button
          onClick={onRestart}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Làm lại bài kiểm tra
        </button>
      </motion.div>
    </motion.div>
  );
}
