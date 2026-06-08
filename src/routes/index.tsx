import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Loader2,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Volume2,
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
      const res = await fetchQuestions();
      const qs = (res.questions ?? []).slice().sort(
        (a, b) => a.question_number - b.question_number,
      );
      if (qs.length === 0) throw new Error("問題が見つかりませんでした。");
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
          J.TEST プレチェック DE
        </h1>
        <p className="mt-3 text-base text-muted-foreground">実力を確認しましょう</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
          お名前 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="お名前を入力してください"
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
              読み込み中...
            </>
          ) : (
            <>
              テストを始める
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
  questions, answers, setAnswers, onSubmit, loading, error,
}: {
  questions: Question[];
  answers: Record<string, Choice>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Choice>>>;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [index, setIndex] = useState(0);
  const q = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const selected = answers[q.question_id];

  const [audioPlayed, setAudioPlayed] = useState<Record<string, boolean>>({});
  const audioReady =
    q.question_type !== "listening" ||
    q.display_rule !== "after_audio" ||
    audioPlayed[q.question_id];

  const pickChoice = (c: Choice) => {
    setAnswers((prev) => ({ ...prev, [q.question_id]: c }));
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit();
    } else {
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const choices = ([
    { key: "a" as Choice, text: q.choice_a },
    { key: "b" as Choice, text: q.choice_b },
    { key: "c" as Choice, text: q.choice_c },
    { key: "d" as Choice, text: q.choice_d },
  ]).filter((c) => c.text && c.text.trim() !== "") as Array<{ key: Choice; text: string }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-primary">問題 {index + 1} / {total}</span>
          <span className="text-xs text-muted-foreground">{Math.round(((index + 1) / total) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.question_id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                q.question_type === "listening"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {q.question_type === "listening" ? (
                <><Volume2 className="h-3 w-3" />聴解</>
              ) : (
                "読解"
              )}
            </span>
            <span className="text-xs text-muted-foreground">No.{q.question_number}</span>
          </div>

          {q.question_type === "reading" && q.passage_text && (
            <div className="mb-4 rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {q.passage_text}
            </div>
          )}

          {q.question_type === "listening" && q.audio_file && (
            <AudioPlayer
              key={q.question_id}
              src={resolveAudioUrl(q.audio_file)}
              onPlayed={() =>
                setAudioPlayed((prev) => ({ ...prev, [q.question_id]: true }))
              }
              played={!!audioPlayed[q.question_id]}
            />
          )}

          <h2 className="text-lg font-bold text-foreground leading-relaxed mb-5">
            {q.question_text}
          </h2>

          {audioReady ? (
            <div className="space-y-2.5">
              {choices.map((c) => {
                const isSelected = selected === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => pickChoice(c.key)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {c.key.toUpperCase()}
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground">{c.text}</span>
                      {isSelected && <CheckCircle2 className="ml-auto h-5 w-5 text-primary shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
              <Volume2 className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                音声を再生すると選択肢が表示されます
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence>
            {selected && audioReady && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6"
              >
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition-all disabled:opacity-60 active:scale-[0.98] ${
                    isLast
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                  }`}
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" />送信中...</>
                  ) : isLast ? (
                    <>回答を送信する<CheckCircle2 className="h-5 w-5" /></>
                  ) : (
                    <>次へ<ChevronRight className="h-5 w-5" /></>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function AudioPlayer({
  src, onPlayed, played,
}: {
  src: string;
  onPlayed: () => void;
  played: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(played);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { setHasPlayedOnce(played); }, [played]);

  const handlePlay = () => {
    const a = audioRef.current;
    if (!a || hasPlayedOnce) return;
    setLoadError(false);
    a.play().catch(() => setLoadError(true));
  };

  return (
    <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => { setIsPlaying(false); setHasPlayedOnce(true); onPlayed(); }}
        onError={() => setLoadError(true)}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlay}
          disabled={hasPlayedOnce || isPlaying}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${
            hasPlayedOnce
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isPlaying
              ? "bg-primary/80 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-95"
          }`}
          aria-label="音声を再生"
        >
          {isPlaying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground">
              {hasPlayedOnce ? "再生済み" : isPlaying ? "再生中..." : "音声を再生してください（1回のみ）"}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>
      {loadError && (
        <p className="mt-2 text-xs text-destructive">音声を読み込めませんでした。</p>
      )}
    </div>
  );
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---------- Result Screen ---------- */

function ResultScreen({
  name, result, onRestart,
}: {
  name: string;
  result: SubmitResponse;
  onRestart: () => void;
}) {
  const band = useMemo(() => calculateBand(result.total_score, result.max_score), [result]);
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          {name}さんの結果
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center"
      >
        <div className="text-sm font-semibold text-muted-foreground mb-2">スコア</div>
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-5xl sm:text-6xl font-extrabold text-foreground tabular-nums">
            {result.total_score}
          </span>
          <span className="text-2xl font-bold text-muted-foreground">/ {result.max_score}</span>
          <span className="text-2xl font-bold text-muted-foreground">点</span>
        </div>
        <div className="text-sm text-muted-foreground">正答率 {pct}%</div>

        <div className="my-6 h-px bg-border" />

        <div className="text-sm font-semibold text-muted-foreground mb-2">判定バンド</div>
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
          href="https://www.facebook.com/J.TEST.VIETNAM"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
        >
          J.TEST公式サイトへ
          <ExternalLink className="h-5 w-5" />
        </a>
        <button
          onClick={onRestart}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          もう一度受ける
        </button>
      </motion.div>
    </motion.div>
  );
}
