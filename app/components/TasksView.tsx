"use client";
import React, { useState } from 'react';

type Task = {
  title: string;
  detail: string;
  progress: number;
  status: string;
  due: string;
};

type Person = { name: string; color: string; tasks?: Task[] };

function TaskRow({ task, person }: { task: Task; person: Person }) {
  const complete = task.progress === 100;

  return (
    <div className="task-row" style={{ gap: '12px' }}>
      <div className="task-main" style={{ flex: 1 }}>
        <span className={`task-check ${complete ? 'done' : ''}`}>{complete ? '✓' : ''}</span>
        <div>
          <strong>{task.title}</strong>
          <small>{task.detail}</small>
        </div>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
        background: person.color + '44', padding: '2px 10px', borderRadius: '20px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: person.color, display: 'inline-block', flexShrink: 0
        }} />
        {person.name.split(' ')[0]}
      </span>
      <div className="task-progress"><div className="mini-bar"><i style={{ width: `${task.progress}%` }} /></div><span>{task.progress}%</span></div>
      <div className={`task-status ${complete ? 'complete' : ''}`}>{task.status}</div>
      <small className="due">{task.due}</small>
    </div>
  );
}

export default function TasksView({ people }: { people: Person[] }) {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'complete'>('all');

  const allTasks = people.flatMap((person) =>
    (person.tasks ?? []).map(t => ({ ...t, person }))
  );

  const filtered = allTasks.filter(t => {
    if (filter === 'in-progress') return t.progress < 100;
    if (filter === 'complete') return t.progress === 100;
    return true;
  });

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.progress === 100).length;
  const inProgressTasks = totalTasks - completedTasks;
  const avgProgress = totalTasks > 0 ? Math.round(allTasks.reduce((s, t) => s + t.progress, 0) / totalTasks) : 0;

  return (
    <section style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
      <div className="section-topline">
        <div><span className="eyebrow">ALL TASKS</span><h1 style={{ fontSize: '24px', margin: 0, color: 'var(--ink)' }}>Consolidated Backlog</h1></div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px', maxWidth: '900px' }}>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--panel-border)',
          borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>Total Tasks</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-1px' }}>{totalTasks}</span>
        </div>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--panel-border)',
          borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>In Progress</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', letterSpacing: '-1px' }}>{inProgressTasks}</span>
        </div>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--panel-border)',
          borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>Completed</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', letterSpacing: '-1px' }}>{completedTasks}</span>
        </div>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--panel-border)',
          borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>Avg Progress</span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--brand-color)', letterSpacing: '-1px' }}>{avgProgress}%</span>
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', maxWidth: '900px' }}>
        {(['all', 'in-progress', 'complete'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            border: filter === f ? '1px solid var(--brand-color)' : '1px solid var(--panel-border)',
            background: filter === f ? 'var(--brand-color)' : 'var(--card-bg)',
            color: filter === f ? '#fff' : 'var(--muted)',
          }}>
            {f === 'all' ? `All (${totalTasks})` : f === 'in-progress' ? `In Progress (${inProgressTasks})` : `Done (${completedTasks})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="tasks-card full-card" style={{ marginTop: '16px', maxWidth: '900px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            No tasks match this filter.
          </div>
        )}
        {filtered.map((task, index) => (
          <TaskRow task={task} person={task.person} key={`${task.title}-${index}`} />
        ))}
      </div>
    </section>
  );
}
