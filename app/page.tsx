"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "./components/Icon";

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    // Automatically clean messy tracking parameters from the URL (fbclid, utm, etc.)
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      const paramsToRemove = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      let changed = false;
      paramsToRemove.forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          changed = true;
        }
      });
      if (changed) {
        // Replace state silently without reloading the page
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }

    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--ink)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "var(--bg-canvas)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-color)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--brand-color)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
            <Icon name="sparkles" size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Boardy</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center", fontSize: 14, fontWeight: 700 }}>
          <a href="#how" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--brand-color)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>How It Works</a>
          <a href="#features" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--brand-color)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>Features</a>
          <a href="#why" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--brand-color)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>Why Boardy</a>
          <Link href="/dashboard" style={{ background: "var(--brand-color)", color: "#fff", padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontSize: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.1)", transition: "transform 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            Open Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial="hidden" animate="show" variants={stagger} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden",
      }}>
        <div className="ambient-glow" style={{ top: -200, left: -200, width: 800, height: 800, position: 'absolute' }} />
        <div className="ambient-glow" style={{ bottom: -200, right: -200, width: 800, height: 800, position: 'absolute' }} />
        
        <motion.div variants={fadeUp} style={{ background: "var(--brand-color-light)", border: "1px solid var(--border-color)", borderRadius: 99, padding: "8px 20px", fontSize: 13, fontWeight: 700, color: "var(--brand-color)", marginBottom: 24, display: "inline-flex", gap: 8, alignItems: "center", position: "relative", zIndex: 10 }}>
          <Icon name="zap" size={16} /> Event-Driven AI Onboarding Copilot
        </motion.div>

        <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(42px, 7vw, 76px)", fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.1, maxWidth: 900, margin: "0 0 24px", position: "relative", zIndex: 10 }}>
          Stop guessing how your <br />
          <span style={{ color: "var(--brand-color)" }}>new hires</span> are doing.
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 19, color: "var(--ink-light)", maxWidth: 640, lineHeight: 1.7, margin: "0 0 48px", fontWeight: 500, position: "relative", zIndex: 10 }}>
          Boardy silently collects metadata from GitHub, Jira & MS 365 — then uses AI to generate role-specific reports for HR and Managers. No screen recording. No surveillance. Just smart onboarding.
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: "flex", gap: 16, position: "relative", zIndex: 10 }}>
          <Link href="/dashboard" style={{ background: "var(--brand-color)", color: "#fff", padding: "18px 40px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 17, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", display: "flex", gap: 8, alignItems: "center", transition: "transform 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            Try the Live Demo <Icon name="arrow" size={18} />
          </Link>
          <a href="#how" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", color: "var(--ink)", padding: "18px 40px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 17, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", transition: "transform 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            See How It Works
          </a>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <section id="how" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 70 }}>
          <motion.span variants={fadeUp} style={{ color: "var(--brand-color)", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>THE 5-STEP WORKFLOW</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, margin: "16px 0 20px" }}>How Boardy Works</motion.h2>
          <motion.p variants={fadeUp} style={{ color: "var(--ink-light)", fontSize: 18, maxWidth: 540, margin: "0 auto" }}>From data collection to AI-powered insight — fully automated, completely private.</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { step: "01", icon: "🔗", title: "Integrate", desc: "Connect GitHub, Jira, MS 365. Employees work as usual — no behavior change." },
            { step: "02", icon: "📡", title: "Collect", desc: "Boardy captures metadata events (commits, task updates). Never screen recordings." },
            { step: "03", icon: "🧠", title: "Analyze", desc: "AI (Gemini) processes event logs and generates role-specific summaries automatically." },
            { step: "04", icon: "📊", title: "Visualize", desc: "HR and Managers see real-time dashboards with scores, signals, and timelines." },
            { step: "05", icon: "💬", title: "Interact", desc: "Managers chat with AI to ask deep questions about any employee's progress." },
          ].map((s, i) => (
            <motion.div variants={fadeUp} key={i} style={{
              background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: 20,
              padding: 32, position: "relative", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: 12, color: "var(--brand-color)", fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>STEP {s.step}</div>
              <div style={{ fontSize: 36, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 70 }}>
          <motion.span variants={fadeUp} style={{ color: "var(--brand-color)", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>CORE CAPABILITIES</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, margin: "16px 0" }}>Built for Modern Teams</motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[
            { title: "Role-Based AI Summaries", desc: "HR sees well-being & milestones. Managers see technical blockers & code output. Same data, different lenses.", badge: "RAG" },
            { title: "Real-Time Event Pipeline", desc: "Webhook-driven architecture captures every commit, task update, and document change as it happens.", badge: "Event-Driven" },
            { title: "Anti-Bossware by Design", desc: "We never record screens, keystrokes, or webcams. Only structured metadata from work tools you already use.", badge: "Privacy-First" },
            { title: "Interactive AI Q&A", desc: "Managers can ask natural language questions like 'Did Maya finish the onboarding flow redesign?' and get data-backed answers.", badge: "Gemini AI" },
          ].map((f, i) => (
            <motion.div variants={fadeUp} key={i} style={{
              background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: 20, padding: "40px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>{f.title}</h3>
                <span style={{ background: "var(--brand-color-light)", color: "var(--brand-color)", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 8 }}>{f.badge}</span>
              </div>
              <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Boardy / Business Value */}
      <section id="why" style={{ padding: "120px 24px", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.span variants={fadeUp} style={{ color: "var(--brand-color)", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>BUSINESS VALUE</motion.span>
          <motion.h2 variants={fadeUp} style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, margin: "16px 0 60px" }}>Why Companies Need Boardy</motion.h2>

          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {[
              { metric: "40%", label: "Reduction in HR check-in time", detail: "Automated summaries replace manual 1-on-1 status meetings." },
              { metric: "$4,700", label: "Saved per new hire", detail: "Early detection of struggling hires prevents costly bad-fit terminations." },
              { metric: "3x", label: "Faster blocker resolution", detail: "AI alerts managers to stuck tasks before they become problems." },
            ].map((v, i) => (
              <div key={i} style={{
                background: "var(--bg-panel)", border: "1px solid var(--border-color)",
                borderRadius: 20, padding: "40px 24px", boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
              }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "var(--brand-color)", marginBottom: 16 }}>{v.metric}</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{v.label}</div>
                <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.6 }}>{v.detail}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px 140px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ position: "relative", zIndex: 10 }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, marginBottom: 20 }}>
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: "var(--ink-light)", fontSize: 19, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
            Try the live dashboard — simulate webhooks, generate AI reports, and chat with the AI assistant.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard" style={{
              background: "var(--brand-color)", color: "#fff",
              padding: "20px 48px", borderRadius: 12, textDecoration: "none", fontWeight: 800, fontSize: 18,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)", display: "inline-flex", gap: 10, alignItems: "center", transition: "transform 0.2s ease"
            }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              Launch Dashboard <Icon name="arrow" size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-panel)", padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "var(--ink-light)", fontWeight: 600 }}>
        <span>© 2026 Boardy · Built for AI in Business Hackathon</span>
        <span style={{ display: "flex", gap: 24 }}>
          <span>Powered by Google Gemini</span>
          <span>Next.js</span>
          <span>SQLite</span>
        </span>
      </footer>
    </div>
  );
}
