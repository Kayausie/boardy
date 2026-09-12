"use client";

import { useMemo, useState, useEffect } from "react";

type Activity = { type: "mail" | "upload" | "task" | "comment"; text: string; meta: string; time: string };
type Task = { title: string; detail: string; progress: number; status: string; due: string };
type Person = { id: number; name: string; initials: string; role: string; department: string; start: string; remaining: number; score: number; status: "Above & beyond" | "Well done" | "Needs support"; color: string; tasks: Task[]; activities: Activity[] };

const people: Person[] = [
  { id: 1, name: "Maya Chen", initials: "MC", role: "Product Designer", department: "Product", start: "12 Aug 2024", remaining: 24, score: 89, status: "Above & beyond", color: "#d9e9ff", tasks: [
    { title: "Redesign the onboarding flow", detail: "Design · Core product", progress: 82, status: "In progress", due: "Due Sep 20" },
    { title: "Run usability test synthesis", detail: "Research · Growth", progress: 100, status: "Complete", due: "Completed Sep 8" },
    { title: "Document component handoff", detail: "Design systems", progress: 45, status: "In progress", due: "Due Sep 24" },
  ], activities: [
    { type: "upload", text: "Uploaded 3 research synthesis files", meta: "Onboarding research", time: "Today, 10:32 AM" },
    { type: "mail", text: "Sent an update to the Growth team", meta: "Subject: Usability insights — week 3", time: "Today, 9:14 AM" },
    { type: "comment", text: "Left feedback on the onboarding prototype", meta: "Figma · 4 comments", time: "Yesterday, 4:48 PM" },
    { type: "task", text: "Moved “Usability test synthesis” to complete", meta: "Task activity", time: "Yesterday, 3:05 PM" },
  ] },
  { id: 2, name: "Daniel Ross", initials: "DR", role: "Frontend Engineer", department: "Engineering", start: "19 Aug 2024", remaining: 31, score: 76, status: "Well done", color: "#ffe6c7", tasks: [
    { title: "Build billing settings screen", detail: "Frontend · Billing", progress: 70, status: "In progress", due: "Due Sep 22" },
    { title: "Resolve mobile navigation bugs", detail: "Frontend · Core product", progress: 100, status: "Complete", due: "Completed Sep 7" },
    { title: "Write component test coverage", detail: "Engineering quality", progress: 35, status: "In progress", due: "Due Sep 28" },
  ], activities: [
    { type: "task", text: "Opened a pull request for billing settings", meta: "PR #286 · 12 files changed", time: "Today, 11:08 AM" },
    { type: "mail", text: "Replied to implementation feedback", meta: "Subject: Billing settings review", time: "Yesterday, 5:20 PM" },
    { type: "comment", text: "Commented on a customer-reported issue", meta: "Issue #1194", time: "Yesterday, 2:15 PM" },
  ] },
  { id: 3, name: "Priya Shah", initials: "PS", role: "People Operations", department: "People", start: "26 Aug 2024", remaining: 38, score: 71, status: "Well done", color: "#e9dcff", tasks: [{ title: "Refresh new starter checklist", detail: "People operations", progress: 90, status: "In progress", due: "Due Sep 17" }, { title: "Audit leave policy pages", detail: "Knowledge base", progress: 100, status: "Complete", due: "Completed Sep 6" }], activities: [{ type: "upload", text: "Uploaded a revised onboarding checklist", meta: "People hub · Version 3", time: "Today, 8:42 AM" }, { type: "mail", text: "Sent welcome information to new starters", meta: "6 recipients", time: "Yesterday, 10:16 AM" }] },
  { id: 4, name: "Marcus Lee", initials: "ML", role: "Account Executive", department: "Sales", start: "02 Sep 2024", remaining: 45, score: 58, status: "Needs support", color: "#d5f0df", tasks: [{ title: "Complete CRM discovery notes", detail: "Sales · Pipeline", progress: 45, status: "In progress", due: "Due Sep 16" }, { title: "Deliver product knowledge assessment", detail: "Training", progress: 20, status: "In progress", due: "Due Sep 19" }], activities: [{ type: "mail", text: "Opened sales enablement resources", meta: "Training series · 3 documents", time: "Yesterday, 1:24 PM" }, { type: "comment", text: "Asked a question in the onboarding channel", meta: "#sales-onboarding", time: "Monday, 3:02 PM" }] },
  { id: 5, name: "Sofia Nguyen", initials: "SN", role: "Marketing Associate", department: "Marketing", start: "09 Sep 2024", remaining: 52, score: 83, status: "Above & beyond", color: "#ffe1eb", tasks: [{ title: "Prepare Q4 campaign brief", detail: "Marketing · Campaigns", progress: 68, status: "In progress", due: "Due Sep 26" }, { title: "Compile social performance report", detail: "Marketing · Reporting", progress: 100, status: "Complete", due: "Completed Sep 9" }], activities: [{ type: "upload", text: "Uploaded the August social report", meta: "Growth drive", time: "Today, 9:02 AM" }, { type: "task", text: "Completed social performance report", meta: "2 days ahead of schedule", time: "Yesterday, 4:34 PM" }] },
];

const iconPaths: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>, check: <path d="m5 12 4 4L19 6"/>, chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 3 2 5-7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.68 18.66a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.02 15a1.7 1.7 0 0 0-1.56-1.03H5.4v-3h.06A1.7 1.7 0 0 0 7.02 9.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.71 4.7v-.08h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z"/></>,
  search: <><circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>, plus: <path d="M12 5v14M5 12h14"/>, filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>, dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>, mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>, upload: <><path d="M12 17V3M7 8l5-5 5 5"/><path d="M5 21h14"/></>, message: <path d="M21 11.5a8.3 8.3 0 0 1-9 8.2 8.3 8.3 0 0 1-4.1-1.1L3 20l1.5-4.3A8.3 8.3 0 1 1 21 11.5Z"/>, clipboard: <><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M9 12h6M9 16h4"/></>, sparkles: <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3ZM19 15l-.6 2.1-2.1.6 2.1.6.6 2.1.6-2.1 2.1-.6-2.1-.6L19 15Z"/>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  apple: <><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5h-2c0-3-1-4-2-5Z"/></>,
  wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
};
function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) { return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>; }

const estimation = {
  "Above & beyond": { copy: "Maya is consistently moving work forward independently and is contributing beyond her core responsibilities.", tone: "excellent" },
  "Well done": { copy: "Daniel is meeting role expectations with steady delivery and a healthy ramp-up trajectory.", tone: "good" },
  "Needs support": { copy: "Marcus would benefit from a focused check-in and a clear plan to build confidence in the role.", tone: "support" },
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);
  const [selectedId, setSelectedId] = useState(1); const [query, setQuery] = useState(""); const [tab, setTab] = useState<"Overview" | "Tasks" | "Activity" | "AI Buddy">("Overview"); const [modal, setModal] = useState(false); const [toast, setToast] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", content: "Hi, I'm your AI Assessment Assistant. I can analyze employee progress, activities, and identify blockers. What would you like to know?" }]);
  const [messageInput, setMessageInput] = useState("");
  const selected = people.find(p => p.id === selectedId) ?? people[0]; 
  const shown = useMemo(() => {
    let filtered = people.filter(p => `${p.name} ${p.role} ${p.department}`.toLowerCase().includes(query.toLowerCase()));
    if (!sortAsc) filtered = [...filtered].reverse();
    return filtered;
  }, [query, sortAsc]);
  const ai = estimation[selected.status]; const progress = Math.round((90 - selected.remaining) / 90 * 100);
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2800); };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    notify("Generating AI summary...");
    try {
      const res = await fetch("/api/summary", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personData: selected })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.summary }]);
        setTab("AI Buddy");
        notify("Summary generated!");
      }
    } catch (e) {
      console.error(e);
      notify("Failed to generate summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const newMessages = [...chatMessages, { role: "user", content: messageInput }];
    setChatMessages(newMessages);
    setMessageInput("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, employeeContext: selected })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages([...newMessages, { role: "assistant", content: data.text }]);
      } else {
        notify("Gemini Error: " + data.error);
      }
    } catch (e) {
      console.error(e);
      notify("Failed to connect to AI Buddy.");
    }
  };



  return <main className="app-shell">
    <aside className="side-rail"><div className="brand-mark">P</div><nav className="rail-nav" aria-label="Primary navigation"><button className="rail-item"><Icon name="grid" /></button><button className="rail-item active"><Icon name="people" /></button><button className="rail-item"><Icon name="check" /></button><button className="rail-item"><Icon name="chart" /></button></nav><button className="rail-item rail-bottom" onClick={() => setIsDarkMode(!isDarkMode)}><Icon name={isDarkMode ? "sun" : "moon"} /></button><button className="rail-item" style={{marginBottom:'10px'}}><Icon name="settings" /></button></aside>
    <section className="staff-panel"><div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Probation</h1></div><button className="avatar user-avatar" onClick={() => notify("User profile clicked")}>KT</button></div><div className="staff-toolbar"><label className="search-field"><Icon name="search" size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" /></label><button className="icon-button" onClick={() => {setSortAsc(!sortAsc); notify(sortAsc ? "Sorted Z-A" : "Sorted A-Z")}}><Icon name="filter" size={17}/></button></div><div className="staff-subheader"><span>ON PROBATION</span><span>{people.length} people</span></div><div className="staff-list">{shown.map(p => <button key={p.id} className={`staff-row ${selected.id === p.id ? "selected" : ""}`} onClick={() => {setSelectedId(p.id); setTab("Overview");}}><span className="avatar" style={{backgroundColor:p.color}}>{p.initials}</span><span className="staff-copy"><strong>{p.name}</strong><small>{p.role}</small></span>{p.status === "Needs support" && <span className="attention-dot"/>}</button>)}{!shown.length && <div className="empty-result">No matching team members.</div>}</div><button className="add-person" onClick={() => setModal(true)}><Icon name="plus" size={17}/> Add new staff</button></section>
    <section className="workspace"><header className="topbar"><div className="crumb"><span>People</span><span>/</span><strong>Probation review</strong></div><div className="top-actions"><button onClick={handleGenerateSummary} disabled={isGenerating} style={{border:'0',background:'#5e55ca',color:'#fff',padding:'8px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'bold',cursor:'pointer'}}>{isGenerating ? "Generating..." : "Generate Summary"}</button><button className="icon-button notification" onClick={() => notify("No new notifications")}><Icon name="bell" size={18}/><i/></button><button className="avatar profile-avatar" onClick={() => notify("Settings menu opened")}>KT</button></div></header><div className="content-wrap">
      <section className="profile-header"><div className="profile-title"><span className="large-avatar" style={{backgroundColor:selected.color}}>{selected.initials}</span><div><div className="title-row"><h2>{selected.name}</h2><span className={`status-pill ${ai.tone}`}>{selected.status}</span></div><p>{selected.role} <span>·</span> {selected.department}</p></div></div><button className="more-button" onClick={() => notify("Review actions are ready to be configured.")}><Icon name="dots" size={20}/></button></section>
      <section className="probation-banner"><div className="calendar-icon"><Icon name="calendar" size={18}/></div><div className="probation-copy"><span>PROBATION PERIOD</span><strong>{selected.remaining} days remaining</strong><small>Started {selected.start} · Review due 10 Oct 2024</small></div><div className="progress-summary"><div><span>Progress</span><strong>{progress}%</strong></div><div className="progress-track"><i style={{width:`${progress}%`}}/></div></div></section>
      <div className="tabs" role="tablist">{(["Overview","Tasks","Activity","AI Buddy"] as const).map(name => <button key={name} className={tab===name?"active":""} onClick={() => setTab(name as any)}>{name}{name === "Tasks" && <span>{selected.tasks.length}</span>}</button>)}</div>
      {tab === "Overview" && <><section className="section-topline"><div><span className="eyebrow">AI PERFORMANCE ESTIMATE</span><h3>Performance snapshot</h3></div><button className="text-button" onClick={() => notify("The estimate refreshes as new activity arrives.")}>How it works <Icon name="arrow" size={15}/></button></section><section className="estimate-grid"><article className={`score-card ${ai.tone}`}><div className="score-card-head"><span>Current estimate</span><Icon name="sparkles" size={18}/></div><div className="score-content"><div className="score-ring" style={{"--score":`${selected.score * 3.6}deg`} as React.CSSProperties}><div><strong>{selected.score}</strong><span>/100</span></div></div><div><h4>{selected.status}</h4><p>{ai.copy}</p></div></div><div className="score-foot"><span>Based on tasks, activity & feedback</span><button onClick={() => notify("Assessment details opened.")}>View details <Icon name="arrow" size={14}/></button></div></article><article className="signals-card"><div className="card-title"><div><span className="eyebrow">KEY SIGNALS</span><h3>What’s driving this</h3></div><button className="more-button"><Icon name="dots" size={18}/></button></div><div className="signals"><Signal icon="check" color="purple" title={`${selected.tasks.filter(t => t.progress === 100).length + 4} tasks completed`} body="on or ahead of schedule" impact="+12"/><Signal icon="message" color="blue" title="Responsive collaboration" body="Avg. reply time: 1h 14m" impact="+8"/><Signal icon="clipboard" color="orange" title="Growth opportunity" body="Documentation consistency" impact="—"/></div></article></section><section className="section-topline task-heading"><div><span className="eyebrow">CURRENT WORK</span><h3>Assigned tasks</h3></div><button className="text-button" onClick={() => setTab("Tasks")}>View all tasks <Icon name="arrow" size={15}/></button></section><section className="tasks-card">{selected.tasks.map(t => <TaskRow task={t} key={t.title}/>)}</section><section className="section-topline activity-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Latest updates</h3></div><button className="text-button" onClick={() => setTab("Activity")}>View activity <Icon name="arrow" size={15}/></button></section><section className="activity-card">{selected.activities.slice(0,3).map((a,i) => <ActivityRow activity={a} key={i}/>)}</section></>}
      {tab === "Tasks" && <section className="tasks-card full-card">{selected.tasks.map(t => <TaskRow task={t} key={t.title}/>)}</section>}{tab === "Activity" && <section className="activity-card full-card">{selected.activities.map((a,i) => <ActivityRow activity={a} key={i}/>)}</section>}
      {tab === "AI Buddy" && <section className="tasks-card full-card" style={{padding:'20px', display:'flex', flexDirection:'column', gap:'16px', minHeight:'300px'}}>
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px'}}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#f1efff' : '#f7f7fb', padding:'10px 14px', borderRadius:'10px', maxWidth:'80%', fontSize:'13px', lineHeight:'1.5', color:'#424459', border:'1px solid #efeff4'}}>
              <strong>{msg.role === 'user' ? 'You' : 'AI Buddy'}</strong><br/>
              {msg.content}
            </div>
          ))}
        </div>
        <div style={{display:'flex', gap:'8px', marginTop:'auto'}}>
          <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask something..." style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #dedee8', fontSize:'13px'}} />
          <button onClick={handleSendMessage} style={{background:'#6259cc', color:'#fff', border:'0', padding:'0 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'bold'}}>Send</button>
        </div>
      </section>}
    </div></section>
    {modal && <div className="modal-backdrop" onMouseDown={() => setModal(false)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={() => setModal(false)}>×</button><span className="eyebrow">NEW PROBATION RECORD</span><h2>Add a team member</h2><p>Create a profile to start tracking onboarding progress and probation milestones.</p><div className="form-grid"><label>Full name<input placeholder="e.g. Jordan Taylor"/></label><label>Department<select defaultValue=""><option value="" disabled>Select department</option><option>Product</option><option>Engineering</option><option>People</option><option>Sales</option></select></label><label>Job title<input placeholder="e.g. Customer Success Manager"/></label><label>Start date<input type="date"/></label></div><div className="modal-actions"><button className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" onClick={() => {setModal(false);notify("Staff member added to the probation workspace.")}}>Create profile</button></div></div></div>}{toast && <div className="toast"><Icon name="check" size={16}/>{toast}</div>}
  </main>;
}

function Signal({icon,color,title,body,impact}:{icon:string;color:string;title:string;body:string;impact:string}) { return <div><span className={`signal-icon ${color}`}><Icon name={icon} size={16}/></span><p><strong>{title}</strong><small>{body}</small></p><b className={impact === "—" ? "neutral" : "positive"}>{impact}</b></div>; }
function TaskRow({task}:{task:Task}) { return <div className="task-row"><div className="task-main"><span className={`task-check ${task.progress===100?"done":""}`}>{task.progress===100&&<Icon name="check" size={13}/>}</span><div><strong>{task.title}</strong><small>{task.detail}</small></div></div><div className="task-progress"><div className="mini-bar"><i style={{width:`${task.progress}%`}}/></div><span>{task.progress}%</span></div><div className={`task-status ${task.progress===100?"complete":""}`}>{task.status}</div><small className="due">{task.due}</small><button className="more-button"><Icon name="dots" size={17}/></button></div>; }
function ActivityRow({activity}:{activity:Activity}) { const icons={mail:"mail",upload:"upload",task:"check",comment:"message"}; return <div className="activity-row"><span className={`activity-icon ${activity.type}`}><Icon name={icons[activity.type]} size={16}/></span><div><strong>{activity.text}</strong><small>{activity.meta}</small></div><time>{activity.time}</time></div>; }

