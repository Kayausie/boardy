"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "#0a0a1a", color: "#e2e8f0", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,26,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#a68a6b,#8c7355)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>Boardy</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center", fontSize: 13 }}>
          <a href="#how" style={{ color: "#94a3b8", textDecoration: "none" }}>How It Works</a>
          <a href="#features" style={{ color: "#94a3b8", textDecoration: "none" }}>Features</a>
          <a href="#why" style={{ color: "#94a3b8", textDecoration: "none" }}>Why Boardy</a>
          <Link href="/dashboard" style={{ background: "linear-gradient(135deg,#a68a6b,#8c7355)", color: "#fff", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
            Open Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial="hidden" animate="show" variants={stagger} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden",
      }}>
        {/* Gradient Orbs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,115,85,0.15) 0%, transparent 70%)", top: -100, left: -200 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(166,138,107,0.1) 0%, transparent 70%)", bottom: -100, right: -150 }} />

        <motion.div variants={fadeUp} style={{ background: "rgba(140,115,85,0.15)", border: "1px solid rgba(140,115,85,0.3)", borderRadius: 99, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: "#a8a0ff", marginBottom: 24, display: "inline-flex", gap: 6, alignItems: "center" }}>
          ⚡ Event-Driven AI Onboarding Copilot
        </motion.div>

        <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.1, maxWidth: 800, margin: "0 0 20px" }}>
          Stop guessing how your <br />
          <span style={{ background: "linear-gradient(135deg,#a68a6b,#c4a484)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>new hires</span> are doing.
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 17, color: "#94a3b8", maxWidth: 560, lineHeight: 1.7, margin: "0 0 36px" }}>
          Boardy silently collects metadata from GitHub, Jira & MS 365 — then uses AI to generate role-specific reports for HR and Managers. No screen recording. No surveillance. Just smart onboarding.
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: "flex", gap: 14 }}>
          <Link href="/dashboard" style={{ background: "linear-gradient(135deg,#a68a6b,#8c7355)", color: "#fff", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 30px rgba(140,115,85,0.4)" }}>
            Try the Live Demo →
          </Link>
          <a href="#how" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            See How It Works
          </a>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <section id="how" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.span variants={fadeUp} style={{ color: "#a68a6b", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>THE 5-STEP WORKFLOW</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: "12px 0 16px" }}>How Boardy Works</motion.h2>
          <motion.p variants={fadeUp} style={{ color: "#94a3b8", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>From data collection to AI-powered insight — fully automated, completely private.</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { step: "01", icon: "🔗", title: "Integrate", desc: "Connect GitHub, Jira, MS 365, Slack. Employees work as usual — no behavior change." },
            { step: "02", icon: "📡", title: "Collect", desc: "Boardy captures metadata events (commits, task updates, doc edits). Never screen recordings." },
            { step: "03", icon: "🧠", title: "Analyze", desc: "AI (Gemini) processes event logs and generates role-specific summaries automatically." },
            { step: "04", icon: "📊", title: "Visualize", desc: "HR and Managers see real-time dashboards with scores, signals, and timelines." },
            { step: "05", icon: "💬", title: "Interact", desc: "Managers chat with AI to ask deep questions about any employee's progress (RAG)." },
          ].map((s, i) => (
            <motion.div variants={fadeUp} key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
              padding: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{ fontSize: 11, color: "#8c7355", fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>STEP {s.step}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.span variants={fadeUp} style={{ color: "#a68a6b", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>CORE CAPABILITIES</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: "12px 0" }}>Built for Modern Teams</motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { title: "Role-Based AI Summaries", desc: "HR sees well-being & milestones. Managers see technical blockers & code output. Same data, different lenses.", badge: "RAG" },
            { title: "Real-Time Event Pipeline", desc: "Webhook-driven architecture captures every commit, task update, and document change as it happens.", badge: "Event-Driven" },
            { title: "Anti-Bossware by Design", desc: "We never record screens, keystrokes, or webcams. Only structured metadata from work tools you already use.", badge: "Privacy-First" },
            { title: "Interactive AI Q&A", desc: "Managers can ask natural language questions like 'Did Maya finish the onboarding flow redesign?' and get data-backed answers.", badge: "Gemini AI" },
          ].map((f, i) => (
            <motion.div variants={fadeUp} key={i} style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "28px 32px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <span style={{ background: "rgba(140,115,85,0.15)", color: "#a8a0ff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>{f.badge}</span>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Boardy / Business Value */}
      <section id="why" style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.span variants={fadeUp} style={{ color: "#a68a6b", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>BUSINESS VALUE</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: "12px 0 40px" }}>Why Companies Need Boardy</motion.h2>

          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {[
              { metric: "40%", label: "Reduction in HR check-in time", detail: "Automated summaries replace manual 1-on-1 status meetings." },
              { metric: "$4,700", label: "Saved per new hire", detail: "Early detection of struggling hires prevents costly bad-fit terminations." },
              { metric: "3x", label: "Faster blocker resolution", detail: "AI alerts managers to stuck tasks before they become problems." },
            ].map((v, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "32px 24px",
              }}>
                <div style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg,#a68a6b,#c4a484)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>{v.metric}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{v.label}</div>
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{v.detail}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: "#94a3b8", fontSize: 15, marginBottom: 32 }}>
            Try the live dashboard — simulate webhooks, generate AI reports, and chat with the AI assistant.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard" style={{
              background: "linear-gradient(135deg,#a68a6b,#8c7355)", color: "#fff",
              padding: "16px 40px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 16,
              boxShadow: "0 10px 40px rgba(140,115,85,0.5)", display: "inline-block",
            }}>
              Launch Dashboard →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#475569" }}>
        <span>© 2026 Boardy · Built for AI in Business Hackathon</span>
        <span>Powered by Google Gemini · Next.js · SQLite</span>
      </footer>
    </div>
  );
}
