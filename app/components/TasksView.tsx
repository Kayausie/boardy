"use client";
import React, { useState } from 'react';

type Task = { title: string; detail: string; progress: number; status: string; due: string; };
type Person = { name: string; color: string; score: number; status: string; role: string; remaining: number; tasks?: Task[] };

function TaskRow({ task, person }: { task: Task; person: Person }) {
  const complete = task.progress === 100;
  const isOverdue = !complete && task.due.includes('Sep 1');
  return (
    <div className="task-row" style={{ gap: '12px' }}>
      <div className="task-main" style={{ flex: 1 }}>
        <span className={`task-check ${complete ? 'done' : ''}`}>{complete ? '✓' : ''}</span>
        <div><strong>{task.title}</strong><small>{task.detail}</small></div>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600,
        color: 'var(--muted)', background: person.color + '44', padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: person.color, display: 'inline-block', flexShrink: 0 }} />
        {person.name.split(' ')[0]}
      </span>
      <div className="task-progress"><div className="mini-bar"><i style={{ width: `${task.progress}%` }} /></div><span>{task.progress}%</span></div>
      <div className={`task-status ${complete ? 'complete' : ''}`} style={isOverdue ? {background:'#fef2f2', color:'#ef4444'} : undefined}>{isOverdue ? 'Overdue' : task.status}</div>
      <small className="due">{task.due}</small>
    </div>
  );
}

export default function TasksView({ people }: { people: Person[] }) {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'complete'>('all');
  const allTasks = people.flatMap((person) => (person.tasks ?? []).map(t => ({ ...t, person })));
  const filtered = allTasks.filter(t => {
    if (filter === 'in-progress') return t.progress < 100;
    if (filter === 'complete') return t.progress === 100;
    return true;
  });
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.progress === 100).length;
  const inProgressTasks = totalTasks - completedTasks;
  const avgProgress = totalTasks > 0 ? Math.round(allTasks.reduce((s, t) => s + t.progress, 0) / totalTasks) : 0;

  // Risk alerts
  const atRiskPeople = people.filter(p => p.status === 'Needs support' || p.score < 60);
  const workloadData = people.map(p => ({
    name: p.name.split(' ')[0],
    active: (p.tasks ?? []).filter(t => t.progress < 100).length,
    done: (p.tasks ?? []).filter(t => t.progress === 100).length,
    color: p.color,
  }));

  // Upcoming deadlines
  const upcomingDeadlines = allTasks
    .filter(t => t.progress < 100 && t.due.startsWith('Due'))
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  return (
    <section style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
      <div className="section-topline">
        <div><span className="eyebrow">ALL TASKS</span><h1 style={{ fontSize: '24px', margin: 0, color: 'var(--ink)' }}>Consolidated Backlog</h1></div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '20px', maxWidth: '900px' }}>
        {[
          { label: 'Total Tasks', value: totalTasks, color: 'var(--ink)' },
          { label: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
          { label: 'Completed', value: completedTasks, color: '#10b981' },
          { label: 'Avg Progress', value: avgProgress + '%', color: 'var(--brand-color)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '16px 18px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</span>
            <div style={{ fontSize: '26px', fontWeight: 700, color: s.color, letterSpacing: '-1px', marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Risk Alerts + Workload Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', maxWidth: '900px' }}>
        {/* Risk Alerts */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: atRiskPeople.length > 0 ? '#ef4444' : '#10b981', animation: atRiskPeople.length > 0 ? 'pulse 2s infinite' : undefined }} />
            <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', fontWeight: 700 }}>Risk Alerts</h3>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>{atRiskPeople.length} flagged</span>
          </div>
          {atRiskPeople.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#10b981', margin: 0 }}>✓ All employees are performing well</p>
          ) : atRiskPeople.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#333', flexShrink: 0 }}>
                {p.name.split(' ').map(n => n[0]).join('')}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>
                  {p.score < 60 ? `Low score: ${p.score}/100` : 'Flagged: Needs support'} · {p.remaining} days left
                </div>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: p.score < 50 ? '#ef4444' : '#f59e0b' }}>{p.score}</span>
            </div>
          ))}
        </div>

        {/* Workload Distribution */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', color: 'var(--ink)', fontWeight: 700 }}>Workload Distribution</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {workloadData.map(w => (
              <div key={w.name} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{w.name}</span>
                <div style={{ display: 'flex', height: '18px', borderRadius: '4px', overflow: 'hidden', background: 'var(--line)' }}>
                  <div style={{ width: `${(w.done / Math.max(w.active + w.done, 1)) * 100}%`, background: '#10b981', transition: 'width 0.5s' }} />
                  <div style={{ width: `${(w.active / Math.max(w.active + w.done, 1)) * 100}%`, background: w.color, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right' }}>{w.active + w.done}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--muted)' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Done</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--muted)' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} /> Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div style={{ marginTop: '16px', maxWidth: '900px', background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '18px 20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--ink)', fontWeight: 700 }}>📅 Upcoming Deadlines</h3>
        <div style={{ display: 'grid', gap: '6px' }}>
          {upcomingDeadlines.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', background: i === 0 ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: i === 0 ? '#f59e0b' : 'var(--muted)', minWidth: '80px' }}>{t.due.replace('Due ', '')}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', background: t.person.color + '33', padding: '2px 8px', borderRadius: '12px' }}>{t.person.name.split(' ')[0]}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: t.progress < 50 ? '#ef4444' : '#f59e0b' }}>{t.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Tasks */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', maxWidth: '900px' }}>
        {(['all', 'in-progress', 'complete'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            border: filter === f ? '1px solid var(--brand-color)' : '1px solid var(--panel-border)',
            background: filter === f ? 'var(--brand-color)' : 'var(--card-bg)',
            color: filter === f ? '#fff' : 'var(--muted)',
          }}>
            {f === 'all' ? `All (${totalTasks})` : f === 'in-progress' ? `In Progress (${inProgressTasks})` : `Done (${completedTasks})`}
          </button>
        ))}
      </div>
      <div className="tasks-card full-card" style={{ marginTop: '12px', maxWidth: '900px', marginBottom: '40px' }}>
        {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No tasks match this filter.</div>}
        {filtered.map((task, index) => <TaskRow task={task} person={task.person} key={`${task.title}-${index}`} />)}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  );
}
