"use client";
import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import ReactMarkdown from 'react-markdown';

const skillGaps = [
  { skill: 'Communication', team: 72, benchmark: 90 },
  { skill: 'Tech Docs', team: 55, benchmark: 85 },
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

  const chartData = useMemo(() => [
    { name: 'Mon', score: 65, events: 4 },
    { name: 'Tue', score: 68, events: 12 },
    { name: 'Wed', score: 74, events: 18 },
    { name: 'Thu', score: 79, events: 25 },
    { name: 'Fri', score: 85, events: 32 },
    { name: 'Today', score: 88, events: dbEvents.length + 32 },
  ], [dbEvents]);

  const avgScore = Math.round(people.reduce((s: number, p: any) => s + p.score, 0) / (people.length || 1));
  const topPerformers = Math.round((people.filter((p: any) => p.status === 'Above & beyond').length / (people.length || 1)) * 100);
  const needsSupport = people.filter((p: any) => p.status === 'Needs support').length;
  const biggestGaps = [...skillGaps].sort((a, b) => (b.benchmark - b.team) - (a.benchmark - a.team)).slice(0, 3);

  const deptData = useMemo(() => {
    const depts: Record<string, { total: number; count: number }> = {};
    people.forEach((p: any) => {
      if (!depts[p.department]) depts[p.department] = { total: 0, count: 0 };
      depts[p.department].total += p.score;
      depts[p.department].count += 1;
    });
    return Object.entries(depts).map(([name, d]) => ({ name, score: Math.round(d.total / d.count) }));
  }, [people]);

  const generateReport = async () => {
    setIsGenerating(true);
    setAiReport(null);
    try {
      const context = `Generate a concise executive performance report (max 300 words) for our onboarding team. Use markdown formatting with headers and bullet points.

REAL-TIME DATA:
- Team: ${people.length} employees on probation
- Avg Score: ${avgScore}/100
- Top performers: ${topPerformers}%
- Needs support: ${needsSupport}
- Events captured: ${dbEvents.length > 0 ? dbEvents.length + 42 : 42}
- Score trend: 65→68→74→79→85→88 (strong upward)
- Biggest skill gaps: ${biggestGaps.map(g => `${g.skill} (team ${g.team}% vs benchmark ${g.benchmark}%)`).join(', ')}
- Individuals: ${people.map((p: any) => `${p.name} (${p.role}): ${p.score}/100 [${p.status}]`).join('; ')}
- Departments: ${deptData.map(d => `${d.name}: ${d.score}`).join(', ')}

Include: 1) Overall Assessment 2) Key Strengths 3) Top 3 Risks 4) Recommended Actions for this week 5) Suggested 1-on-1 talking points. Be specific and actionable.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: context }], userId: people[0]?.id || 1, viewRole: 'Manager' })
      });
      if (!res.ok) { setAiReport('⚠️ Failed to generate report. Try again.'); return; }
      if (!res.body) throw new Error('No body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAiReport(text);
      }
    } catch { setAiReport('⚠️ Connection error. Try again.'); }
    finally { setIsGenerating(false); }
  };

  const cardStyle: React.CSSProperties = { background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '18px 20px' };

  return (
    <section style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
      <div className="section-topline">
        <div><span className="eyebrow">REPORTS</span><h1 style={{ fontSize: '24px', margin: 0, color: 'var(--ink)' }}>AI Performance Stats</h1></div>
      </div>

      {/* 4 Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '20px', maxWidth: '1000px' }}>
        {[
          { label: 'Avg Team Score', value: avgScore, sub: 'Out of 100', color: 'var(--ink)' },
          { label: 'Above & Beyond', value: topPerformers + '%', sub: 'Of all employees', color: '#10b981' },
          { label: 'Needs Support', value: needsSupport, sub: 'Require attention', color: needsSupport > 0 ? '#ef4444' : '#10b981' },
          { label: 'Total Events', value: dbEvents.length > 0 ? dbEvents.length + 42 : 42, sub: 'Captured silently', color: 'var(--brand-color)' },
        ].map(s => (
          <div key={s.label} style={cardStyle}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, letterSpacing: '-1px', marginTop: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Score Trend + Skill Gaps Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', maxWidth: '1000px' }}>
        <div style={{ ...cardStyle, padding: '22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--ink)', fontWeight: 700 }}>Team Score Trend</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="var(--brand-color)" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '22px' }}>
          <h3 style={{ margin: '0 0 2px', fontSize: '15px', color: 'var(--ink)', fontWeight: 700 }}>Skill Gap Analysis</h3>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--muted)' }}>Team avg vs industry benchmark</p>
          <div style={{ width: '100%', height: 232 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillGaps} outerRadius="68%">
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: 'var(--muted)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Team" dataKey="team" stroke="var(--brand-color)" fill="var(--brand-color)" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2-col: Dept Performance + Skill Deficiencies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', maxWidth: '1000px' }}>
        {/* Department Performance */}
        <div style={{ ...cardStyle, padding: '22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--ink)', fontWeight: 700 }}>Department Performance</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--panel-border)', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', fontSize: '12px' }} />
                <Bar dataKey="score" fill="var(--brand-color)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Skill Deficiencies */}
        <div style={{ ...cardStyle, padding: '22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', color: 'var(--ink)', fontWeight: 700 }}>Common Skill Deficiencies</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[...skillGaps].sort((a, b) => (a.team - a.benchmark) - (b.team - b.benchmark)).map(gap => {
              const deficit = gap.benchmark - gap.team;
              return (
                <div key={gap.skill} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 65px', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{gap.skill}</span>
                  <div style={{ position: 'relative', height: '7px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, height: '100%', width: `${gap.team}%`, borderRadius: '4px',
                      background: deficit > 25 ? '#ef4444' : deficit > 15 ? '#f59e0b' : '#10b981', transition: 'width 0.5s'
                    }} />
                    <div style={{ position: 'absolute', top: '-3px', left: `${gap.benchmark}%`, width: '2px', height: '13px', background: '#94a3b8', borderRadius: '1px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'right', color: deficit > 25 ? '#ef4444' : deficit > 15 ? '#f59e0b' : '#10b981' }}>-{deficit}% gap</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Probation Countdown */}
      <div style={{ marginTop: '16px', maxWidth: '1000px', ...cardStyle, padding: '22px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '15px', color: 'var(--ink)', fontWeight: 700 }}>⏱ Probation Countdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${people.length}, 1fr)`, gap: '12px' }}>
          {people.map((p: any) => {
            const pct = Math.round(((90 - p.remaining) / 90) * 100);
            return (
              <div key={p.name} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 8px' }}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--line)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke={p.remaining < 30 ? '#ef4444' : p.remaining < 45 ? '#f59e0b' : '#10b981'} strokeWidth="4"
                      strokeDasharray={`${pct * 1.76} 176`} strokeLinecap="round" transform="rotate(-90 32 32)" />
                  </svg>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{p.remaining}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{p.name.split(' ')[0]}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>days left</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Executive Report */}
      <div style={{ marginTop: '16px', maxWidth: '1000px', ...cardStyle, padding: '22px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiReport ? '16px' : '0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--ink)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--brand-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3ZM19 15l-.6 2.1-2.1.6 2.1.6.6 2.1.6-2.1 2.1-.6-2.1-.6L19 15Z" />
              </svg>
              AI Executive Report
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>Generated from real-time charts, skill gaps, department data & employee metrics</p>
          </div>
          <button onClick={generateReport} disabled={isGenerating} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isGenerating ? 'wait' : 'pointer',
            border: 'none', background: isGenerating ? 'var(--line)' : 'var(--brand-color)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {isGenerating ? (<><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Generating…</>) :
              (<><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3Z" /></svg>Generate Report</>)}
          </button>
        </div>
        {aiReport && (
          <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--panel-border)', fontSize: '13px', lineHeight: '1.75', color: 'var(--ink)' }}>
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
