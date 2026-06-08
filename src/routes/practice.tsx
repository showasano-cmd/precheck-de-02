import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home, ChevronRight, Clock, BookOpen } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is the primary purpose of a pre-operational checklist?",
    options: [
      "To document employee attendance",
      "To identify potential hazards before starting work",
      "To calculate daily production targets",
      "To schedule maintenance intervals",
    ],
    correctIndex: 1,
    explanation: "Pre-operational checklists are designed to systematically identify potential hazards, equipment issues, and safety concerns before work begins, reducing the risk of accidents and equipment failure.",
  },
  {
    id: 2,
    text: "Which of the following is considered a critical control point in DE02 compliance?",
    options: [
      "Office temperature settings",
      "Emergency stop functionality",
      "Break room cleanliness",
      "Parking lot lighting",
    ],
    correctIndex: 1,
    explanation: "Emergency stop functionality is a critical control point because it directly impacts the ability to halt operations immediately when a hazardous condition is detected, protecting personnel and equipment.",
  },
  {
    id: 3,
    text: "How frequently should safety equipment be inspected according to standard DE02 guidelines?",
    options: [
      "Only after an incident occurs",
      "Annually during the fiscal review",
      "At regular intervals as specified by manufacturer and regulation",
      "Only when visibly damaged",
    ],
    correctIndex: 2,
    explanation: "Safety equipment must be inspected at regular intervals as specified by both the manufacturer's recommendations and applicable regulatory requirements to ensure continued reliability and compliance.",
  },
  {
    id: 4,
    text: "What does the 'DE' in DE02 stand for in the certification context?",
    options: [
      "Direct Evaluation",
      "Designated Equipment",
      "Driver Education",
      "Differential Equation",
    ],
    correctIndex: 1,
    explanation: "In the DE02 certification context, 'DE' refers to Designated Equipment — specialized machinery and systems that require specific operational knowledge and safety protocols.",
  },
  {
    id: 5,
    text: "When should a near-miss incident be reported?",
    options: [
      "Only if someone was injured",
      "Within 24 hours if management asks",
      "Immediately, regardless of whether injury occurred",
      "At the end of the work week",
    ],
    correctIndex: 2,
    explanation: "Near-miss incidents should be reported immediately, even when no injury occurs. They provide valuable learning opportunities to prevent future accidents and improve safety protocols.",
  },
  {
    id: 6,
    text: "What is the correct procedure when a lockout/tagout device is found to be damaged?",
    options: [
      "Use it anyway if it mostly works",
      "Remove it and proceed with caution",
      "Replace it with a new device before starting work",
      "Ignore it and notify someone later",
    ],
    correctIndex: 2,
    explanation: "Damaged lockout/tagout devices must be replaced with new, fully functional devices before any work begins. Using compromised safety equipment violates core safety principles and puts workers at risk.",
  },
  {
    id: 7,
    text: "Which document is required to be posted in a visible location at all DE02-designated work sites?",
    options: [
      "Employee birthday calendar",
      "Emergency procedures and contact information",
      "Company stock price chart",
      "Break schedule",
    ],
    correctIndex: 1,
    explanation: "Emergency procedures and contact information must be visibly posted at all designated work sites to ensure all personnel can quickly access critical safety information during an emergency.",
  },
  {
    id: 8,
    text: "What is the minimum safe distance from energized electrical equipment during DE02 operations?",
    options: [
      "Arm's length",
      "As specified by the specific voltage and applicable safety standards",
      "At least 1 meter in all cases",
      "There is no minimum distance requirement",
    ],
    correctIndex: 1,
    explanation: "The minimum safe distance depends on the specific voltage level of the equipment and must follow applicable safety standards (such as NFPA 70E or local equivalents), which define approach boundaries based on voltage.",
  },
  {
    id: 9,
    text: "Who is authorized to remove a lockout/tagout device?",
    options: [
      "Any supervisor on duty",
      "The person who applied it, or a designated authorized employee following proper procedure",
      "The first person to arrive in the morning",
      "Any certified electrician",
    ],
    correctIndex: 1,
    explanation: "Only the individual who applied the lockout/tagout device, or a specifically designated authorized employee following established verification procedures, is permitted to remove it. This prevents accidental energization.",
  },
  {
    id: 10,
    text: "What should be done if an operator notices unusual vibration in DE02 equipment during operation?",
    options: [
      "Continue operating and note it in the next daily report",
      "Increase operating speed to see if it resolves",
      "Stop the equipment and report it immediately",
      "Ask a coworker if they also notice it",
    ],
    correctIndex: 2,
    explanation: "Unusual vibration can indicate mechanical failure, misalignment, or other serious issues that could lead to equipment damage or safety hazards. The equipment should be stopped immediately and the issue reported.",
  },
];

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice Test — PreCheck DE02" },
      { name: "description", content: "Take a practice test for the DE02 certification with instant feedback and detailed explanations." },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean; selected: number }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQ];
  const isCorrect = selectedOption === question.correctIndex;
  const progress = ((currentQ) / questions.length) * 100;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setAnswered(true);
    if (selectedOption === question.correctIndex) {
      setScore((s) => s + 1);
    }
    setAnswers((a) => [...a, { questionId: question.id, correct: selectedOption === question.correctIndex, selected: selectedOption }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-8 text-center"
          >
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
              {passed ? (
                <CheckCircle className="h-10 w-10 text-success" />
              ) : (
                <XCircle className="h-10 w-10 text-destructive" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-foreground">
              {passed ? "Congratulations!" : "Keep Practicing"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {passed
                ? "You passed with flying colors. You're ready for the real exam!"
                : "You're getting there. Review your mistakes and try again."}
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="text-5xl font-extrabold gradient-text">{percentage}%</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {score} out of {questions.length} correct
            </p>

            <div className="mt-8 grid grid-cols-5 gap-2">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full ${a.correct ? "bg-success" : "bg-destructive"}`}
                  title={`Question ${i + 1}: ${a.correct ? "Correct" : "Incorrect"}`}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                Back Home
              </Link>
            </div>
          </motion.div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Review Your Answers</h3>
            {answers.map((a, i) => {
              const q = questions.find((q) => q.id === a.questionId)!;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${a.correct ? "bg-success/10" : "bg-destructive/10"}`}>
                      {a.correct ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {i + 1}. {q.text}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your answer: <span className={a.correct ? "text-success" : "text-destructive"}>{q.options[a.selected]}</span>
                      </p>
                      {!a.correct && (
                        <p className="mt-1 text-xs text-success">
                          Correct: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Question {currentQ + 1} of {questions.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.round((questions.length - currentQ) * 1.5)} min remaining</span>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: `${(currentQ / questions.length) * 100}%` }}
              animate={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
              {question.text}
            </h2>

            <div className="mt-6 space-y-3">
              {question.options.map((option, i) => {
                let stateClass = "border-border hover:border-primary/50 hover:bg-accent";
                if (answered) {
                  if (i === question.correctIndex) {
                    stateClass = "border-success bg-success/5";
                  } else if (i === selectedOption) {
                    stateClass = "border-destructive bg-destructive/5";
                  } else {
                    stateClass = "border-border opacity-50";
                  }
                } else if (selectedOption === i) {
                  stateClass = "border-primary bg-primary/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-200 ${stateClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors ${
                        answered
                          ? i === question.correctIndex
                            ? "border-success bg-success text-success-foreground"
                            : i === selectedOption
                            ? "border-destructive bg-destructive text-destructive-foreground"
                            : "border-border"
                          : selectedOption === i
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{option}</span>
                      {answered && i === question.correctIndex && (
                        <CheckCircle className="ml-auto h-5 w-5 text-success shrink-0" />
                      )}
                      {answered && i === selectedOption && i !== question.correctIndex && (
                        <XCircle className="ml-auto h-5 w-5 text-destructive shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`rounded-xl p-4 ${isCorrect ? "bg-success/5 border border-success/20" : "bg-destructive/5 border border-destructive/20"}`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              {!answered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95"
                >
                  Submit Answer
                  <CheckCircle className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                >
                  {currentQ < questions.length - 1 ? "Next Question" : "View Results"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
