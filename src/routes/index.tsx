import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle, Brain, Timer, BarChart3, ArrowRight, Sparkles, Shield, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Brain,
    title: "Smart Practice",
    description: "Adaptive question selection that learns from your mistakes and focuses on weak areas.",
  },
  {
    icon: Timer,
    title: "Timed Sessions",
    description: "Simulate real exam conditions with configurable time limits per question set.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Detailed analytics showing your improvement over time and topic mastery levels.",
  },
  {
    icon: Shield,
    title: "Exam Ready",
    description: "Comprehensive coverage of all DE02 test topics with verified question banks.",
  },
  {
    icon: Target,
    title: "Focused Review",
    description: "Bookmark difficult questions and revisit them in dedicated review sessions.",
  },
  {
    icon: Sparkles,
    title: "Instant Feedback",
    description: "Get immediate explanations for every answer to accelerate your learning curve.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PreCheck DE02 — Practice & Pass" },
      { name: "description", content: "Master the DE02 certification with smart practice tests, progress tracking, and adaptive learning." },
      { property: "og:title", content: "PreCheck DE02 — Practice & Pass" },
      { property: "og:description", content: "Master the DE02 certification with smart practice tests, progress tracking, and adaptive learning." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Trusted by 10,000+ test takers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Master the{" "}
              <span className="gradient-text">DE02</span>{" "}
              Certification
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Smart practice tests that adapt to your learning style. Track progress, review mistakes, 
              and walk into your exam with confidence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
              >
                Start Practicing
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent hover:border-accent"
              >
                Learn More
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>500+ Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Real Exam Format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Free Forever</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to pass
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete study toolkit designed for serious test takers who want results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "500+", label: "Practice Questions" },
              { value: "94%", label: "Pass Rate" },
              { value: "10K+", label: "Active Users" },
              { value: "4.9", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-4xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center lg:px-16"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-primary to-oklch(0.45 0.12 200)" />
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
              Ready to ace your exam?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Join thousands of successful test takers. Start practicing today and see your scores improve.
            </p>
            <div className="mt-8">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-8 py-4 text-base font-semibold text-primary transition-all hover:bg-white hover:shadow-xl active:scale-95"
              >
                Start Free Practice
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">PreCheck DE02</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for test takers, by test takers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
