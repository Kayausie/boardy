"use client";
import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ReactMarkdown from 'react-markdown';

const skillGaps = [
  { skill: 'Communication', team: 72, benchmark: 90 },
  { skill: 'Technical Docs', team: 55, benchmark: 85 },
  { skill: 'Time Mgmt', team: 68, benchmark: 88 },
  { skill: 'Tool Proficiency', team: 78, benchmark: 92 },
  { skill: 'Domain Knowledge', team: 45, benchmark: 80 },
  { skill: 'Collaboration', team: 82, benchmark: 90 },
  { skill: 'Problem Solving', team: 63, benchmark: 88 },
  { skill: 'Self-Direction', team: 58, benchmark: 85 },
];

export default function ChartView({ people, dbEvents }: { people: any[], dbEvents: any[] }) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const chartData = useMemo(() => {
    return [
      { name: 'Mon', score: 65, events: 4 },
      { name: 'Tue', score: 68, events: 12 },
      { name: 'Wed', score: 74, events: 18 },
      { name: 'Thu', score: 79, events: 25 },
      { name: 'Fri', score: 85, events: 32 },
      { name: 'Today', score: 88, events: dbEvents.length + 32 },
    ];
  }, [dbEvents]);

  const avgScore = Math.round(people.reduce((sum: number, p: any) => sum + p.score, 0) / (people.length || 1));
  const topPerformers = Math.round((people.filter((p: any) => p.status === 'Above & beyond').length / (people.length || 1)) * 100);
  const needsSupport = people.filter((p: any) => p.status === 'Needs support').length;

  const biggestGaps = [...skillGaps].sort((a, b) => (b.benchmark - b.team) - (a.benchmark - a.team)).slice(0, 3);

  const generateReport = async () => {
    setIsGenerating(true);
    setAiReport(null);
    try {
      const context = `Generate a concise executive performance report (max 250 words) for our onboarding team based on this real-time data:
- Team size: ${people.length} employees on probation
- Average AI Score: ${avgScore}/100
- Top performers (Above & Beyond): ${topPerformers}%
- Employees needing support: ${needsSupport}
- Total events captured: ${dbEvents.length > 0 ? dbEvents.length + 42 : 42}
- Score trend this week: 65 → 68 → 74 → 79 → 85 → 88 (upward)
- Biggest skill gaps: ${biggestGaps.map(g => `${g.skill} (team: ${g.team}%, benchmark: ${g.benchmark}%)`).join(', ')}
- Individual scores: ${people.map((p: any) => `${p.name}: ${p.score}/100 (${p.status})`).join(', ')}

Format with markdown. Include: 1) Overall Assessment 2) Key Strengths 3) Areas of Concern 4) Recommended Actions. Be specific and data-driven.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: context }],
          userId: people[0]?.id || 1,
          viewRole: 'Manager'
        })
      });

      if (!res.ok) {
        setAiReport('⚠️ Failed to generate report. Please try again.');
        return;
      }
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAiReport(text);
      }
    } catch (e) {
      setAiReport('⚠️ Connection error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
      <div className="section-topline">
        <div><span className="eyebrow">REPORTS</span><h1 style={{ fontSize: '24px', margin: 0, color: 'var(--ink)' }}>AI Performance Stats</h1></div>
      </div>

      {/* Stat cards */}
      <div className="chart-view" style={{ marginTop: '24px', maxWidth: '1000px' }}>
        <div className="stat-card">
          <div className="stat-label">Avg Team Score</div>
          <div className="stat-value">{avgScore}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Out of 100</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Above & Beyond</div>
          <div className="stat-value">{topPerformers}%</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Of all employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Needs Support</div>
          <div className="stat-value" style={{ color: needsSupport > 0 ? '#ef4444' : '#10b981' }}>{needsSupport}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Require attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{dbEvents.length > 0 ? dbEvents.length + 42 : 42}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Captured silently</div>
        </div>
      </div>

      {/* Two-column layout: Score Trend + Skill Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px', maxWidth: '1000px' }}>
        {/* Score Trend Chart */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', letterSpacing: '-0.25px', color: 'var(--ink)' }}>Team Score Trend</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--panel-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'var(--card-bg)', color: 'var(--ink)' }} />
                <Line type="monotone" dataKey="score" stroke="var(--brand-color)" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gaps Radar */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', letterSpacing: '-0.25px', color: 'var(--ink)' }}>Skill Gap Analysis</h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--muted)' }}>Team average vs industry benchmark</p>
          <div style={{ width: '100%', height: 248 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillGaps} outerRadius="70%">
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Team" dataKey="team" stroke="var(--brand-color)" fill="var(--brand-color)" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Skill Gaps Table */}
      <div style={{ marginTop: '20px', maxWidth: '1000px', background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', letterSpacing: '-0.25px', color: 'var(--ink)' }}>Common Skill Deficiencies</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {skillGaps.sort((a, b) => (a.team - a.benchmark) - (b.team - b.benchmark)).map(gap => {
            const deficit = gap.benchmark - gap.team;
            return (
              <div key={gap.skill} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 80px', gap: '16px', alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{gap.skill}</span>
                <div style={{ position: 'relative', height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%',
                    width: `${gap.team}%`, borderRadius: '4px',
                    background: deficit > 25 ? '#ef4444' : deficit > 15 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.5s ease'
                  }} />
                  <div style={{
                    position: 'absolute', top: '-3px', left: `${gap.benchmark}%`,
                    width: '2px', height: '14px', background: '#94a3b8', borderRadius: '1px'
                  }} />
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 600, textAlign: 'right',
                  color: deficit > 25 ? '#ef4444' : deficit > 15 ? '#f59e0b' : '#10b981'
                }}>
                  -{deficit}% gap
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Generated Report */}
      <div style={{ marginTop: '20px', maxWidth: '1000px', background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiReport ? '16px' : '0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', letterSpacing: '-0.25px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--brand-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3ZM19 15l-.6 2.1-2.1.6 2.1.6.6 2.1.6-2.1 2.1-.6-2.1-.6L19 15Z" />
              </svg>
              AI Executive Report
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>Generated from real-time charts, skill gaps & employee data</p>
          </div>
          <button onClick={generateReport} disabled={isGenerating} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: isGenerating ? 'wait' : 'pointer',
            border: 'none',
            background: isGenerating ? 'var(--line)' : 'var(--brand-color)',
            color: '#fff',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {isGenerating ? (
              <>
                <span style={{
                  width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }} />
                Generating…
              </>
            ) : (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3Z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
        {aiReport && (
          <div style={{
            padding: '20px', background: 'var(--bg)', borderRadius: '10px',
            border: '1px solid var(--panel-border)',
            fontSize: '13.5px', lineHeight: '1.7', color: 'var(--ink)'
          }}>
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
