import React from 'react';

type Task = {
  title: string;
  detail: string;
  progress: number;
  status: string;
  due: string;
};

type PersonWithTasks = { tasks?: Task[] };

function TaskRow({ task }: { task: Task }) {
  const complete = task.progress === 100;

  return (
    <div className="task-row">
      <div className="task-main">
        <span className={`task-check ${complete ? 'done' : ''}`}>{complete ? '✓' : ''}</span>
        <div><strong>{task.title}</strong><small>{task.detail}</small></div>
      </div>
      <div className="task-progress"><div className="mini-bar"><i style={{ width: `${task.progress}%` }} /></div><span>{task.progress}%</span></div>
      <div className={`task-status ${complete ? 'complete' : ''}`}>{task.status}</div>
      <small className="due">{task.due}</small>
      <button className="more-button" aria-label={`Actions for ${task.title}`}>•••</button>
    </div>
  );
}

export default function TasksView({ people }: { people: PersonWithTasks[] }) {
  return (
    <section style={{flex: 1, padding: '40px', overflowY: 'auto'}}>
      <div className="section-topline">
        <div><span className="eyebrow">ALL TASKS</span><h1 style={{fontSize:'24px',margin:0,color:'var(--ink)'}}>Consolidated Backlog</h1></div>
      </div>
      <div className="tasks-card full-card" style={{marginTop:'24px', maxWidth:'900px'}}>
        {people.flatMap((person) => person.tasks ?? []).map((task, index) => <TaskRow task={task} key={`${task.title}-${index}`}/>)}
      </div>
    </section>
  );
}
