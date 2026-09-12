import React from 'react';
import { TaskRow } from '../dashboard/page';

export default function TasksView({ people }: { people: any[] }) {
  return (
    <section style={{flex: 1, padding: '40px', overflowY: 'auto'}}>
      <div className="section-topline">
        <div><span className="eyebrow">ALL TASKS</span><h1 style={{fontSize:'24px',margin:0,color:'var(--ink)'}}>Consolidated Backlog</h1></div>
      </div>
      <div className="tasks-card full-card" style={{marginTop:'24px', maxWidth:'900px'}}>
        {people.flatMap(p => p.tasks).map((t, i) => <TaskRow task={t} key={i}/>)}
      </div>
    </section>
  );
}
