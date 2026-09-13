"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";


const fadeUp: any = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const stagger: any = { show: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    // Automatically clean messy tracking parameters from the URL
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
      <nav className={scrolled ? "apple-glass" : ""} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: scrolled ? "1px solid var(--border-color)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>Boardy</span>
          <span className="metallic-text" style={{ fontWeight: 900, fontSize: 32, lineHeight: 0.5 }}>.</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center", fontSize: 14, fontWeight: 600 }}>
          <a href="#how" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--ink)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>How It Works</a>
          <a href="#features" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--ink)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>Features</a>
          <a href="#why" style={{ color: "var(--ink-light)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--ink)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-light)"}>Why Boardy</a>
          <Link href="/dashboard" className="apple-btn" style={{ background: "var(--ink)", color: "var(--bg-canvas)", padding: "8px 20px", textDecoration: "none", fontSize: 14 }}>
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial="hidden" animate="show" variants={stagger} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px", position: "relative",
      }}>
        
        <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(46px, 8vw, 96px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 1000, margin: "0 0 24px" }}>
          Stop guessing how your <br />
          <span className="metallic-text">new hires</span> are doing.
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 21, color: "var(--ink-light)", maxWidth: 640, lineHeight: 1.6, margin: "0 0 48px", fontWeight: 500, letterSpacing: "0" }}>
          Boardy silently collects metadata from GitHub, Jira & MS 365 — then uses AI to generate role-specific reports for HR and Managers. No screen recording. No surveillance. Just smart onboarding.
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: "flex", gap: 16 }}>
          <Link href="/dashboard" className="apple-btn metallic-bg" style={{ padding: "18px 40px", textDecoration: "none", fontSize: 17 }}>
            Try the Live Demo
          </Link>
          <a href="#how" className="apple-btn" style={{ background: "transparent", color: "var(--brand-color)", padding: "18px 40px", textDecoration: "none", fontSize: 17 }}>
            See How It Works ↗
          </a>
        </motion.div>
      </motion.section>

      {/* How It Works (Process Map Timeline) */}
      <section id="how" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 120 }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 16px" }}>How Boardy Works.</motion.h2>
          <motion.p variants={fadeUp} style={{ color: "var(--ink-light)", fontSize: 21, maxWidth: 600, margin: "0 auto", letterSpacing: "0" }}>From data collection to AI-powered insight — fully automated, completely private.</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} style={{ position: "relative", maxWidth: 1000, margin: "0 auto" }}>
          {/* Horizontal Track */}
          <div style={{ position: "absolute", top: "50%", left: "5%", right: "5%", height: 3, background: "var(--border-color)", transform: "translateY(-50%)", zIndex: 0 }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            {[
              { title: "Integrate", desc: "Connect GitHub, Jira, MS 365. Employees work as usual." },
              { title: "Collect", desc: "Boardy captures metadata events. Never screen recordings." },
              { title: "Analyze", desc: "AI processes event logs and generates role-specific summaries." },
              { title: "Visualize", desc: "HR and Managers see real-time dashboards with timelines." },
              { title: "Interact", desc: "Managers chat with AI to ask deep questions about progress." },
            ].map((s, i) => (
              <motion.div variants={fadeUp} key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20%", position: "relative" }}>
                
                {/* Top Content (Even steps) */}
                <div style={{ height: 160, display: "flex", flexDirection: "column", justifyContent: "flex-end", opacity: i % 2 === 0 ? 1 : 0 }}>
                  {i % 2 === 0 && (
                     <div style={{ textAlign: "center", paddingBottom: 24 }}>
                       <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{s.title}</h3>
                       <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.5, padding: "0 10px" }}>{s.desc}</p>
                     </div>
                  )}
                </div>

                {/* The Timeline Node */}
                <div style={{ 
                  width: 44, height: 44, borderRadius: "50%", background: "var(--bg-canvas)", 
                  border: "4px solid var(--brand-color)", display: "grid", placeItems: "center", 
                  fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: "8px 0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                }}>
                  {i + 1}
                </div>

                {/* Bottom Content (Odd steps) */}
                <div style={{ height: 160, display: "flex", flexDirection: "column", justifyContent: "flex-start", opacity: i % 2 !== 0 ? 1 : 0 }}>
                   {i % 2 !== 0 && (
                     <div style={{ textAlign: "center", paddingTop: 24 }}>
                       <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{s.title}</h3>
                       <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.5, padding: "0 10px" }}>{s.desc}</p>
                     </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features (Bento Grid 2) */}
      <section id="features" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 80 }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 16px" }}>Built for Modern Teams.</motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[
            { title: "Role-Based AI Summaries", desc: "HR sees well-being & milestones. Managers see technical blockers & code output. Same data, different lenses.", badge: "RAG" },
            { title: "Real-Time Event Pipeline", desc: "Webhook-driven architecture captures every commit, task update, and document change as it happens.", badge: "Event-Driven" },
            { title: "Anti-Bossware by Design", desc: "We never record screens, keystrokes, or webcams. Only structured metadata from work tools you already use.", badge: "Privacy-First" },
            { title: "Interactive AI Q&A", desc: "Managers can ask natural language questions like 'Did Maya finish the onboarding flow redesign?' and get data-backed answers.", badge: "Gemini AI" },
          ].map((f, i) => (
            <motion.div variants={fadeUp} key={i} className="bento-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
                <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", maxWidth: 280 }}>{f.title}</h3>
                <span style={{ background: "var(--brand-color-light)", color: "var(--brand-color)", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8 }}>{f.badge}</span>
              </div>
              <p style={{ fontSize: 17, color: "var(--ink-light)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Boardy / Business Value */}
      <section id="why" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 80px" }}>Why Companies Need Boardy.</motion.h2>

          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {[
              { metric: "40%", label: "Reduction in check-ins", detail: "Automated summaries replace manual 1-on-1 status meetings." },
              { metric: "$4,700", label: "Saved per new hire", detail: "Early detection of struggling hires prevents costly bad-fit terminations." },
              { metric: "3x", label: "Faster blocker resolution", detail: "AI alerts managers to stuck tasks before they become problems." },
            ].map((v, i) => (
              <div key={i} className="bento-box" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="metallic-text" style={{ fontSize: 72, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.04em" }}>{v.metric}</div>
                <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 12, letterSpacing: "-0.01em" }}>{v.label}</div>
                <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.6 }}>{v.detail}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: "160px 24px", textAlign: "center" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 24 }}>
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: "var(--ink-light)", fontSize: 21, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px", letterSpacing: "0" }}>
            Try the live dashboard — simulate webhooks, generate AI reports, and chat with the AI assistant.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard" className="apple-btn metallic-bg" style={{ padding: "20px 48px", textDecoration: "none", fontSize: 19 }}>
              Launch Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-panel)", padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "var(--ink-light)", fontWeight: 500 }}>
        <span>© 2026 Boardy · Built for AI in Business Hackathon</span>
      </footer>
    </div>
  );
}
