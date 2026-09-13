"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import GridView from '../components/GridView';
import TasksView from '../components/TasksView';
import ChartView from '../components/ChartView';

type Activity = { type: "mail" | "upload" | "task" | "comment"; text: string; meta: string; time: string };
type Task = { title: string; detail: string; progress: number; status: string; due: string };
type Person = { id: number; name: string; initials: string; role: string; department: string; start: string; remaining: number; score: number; status: "Above & beyond" | "Well done" | "Needs support"; color: string; tasks: Task[]; activities: Activity[] };

const initialPeople: Person[] = [
  { id: 1, name: "Maya Chen", initials: "MC", role: "Product Designer", department: "Product", start: "12 Aug 2026", remaining: 24, score: 89, status: "Above & beyond", color: "#d9e9ff", tasks: [
    { title: "Redesign the onboarding flow", detail: "Design · Core product", progress: 82, status: "In progress", due: "Due Sep 20" },
    { title: "Run usability test synthesis", detail: "Research · Growth", progress: 100, status: "Complete", due: "Completed Sep 8" },
    { title: "Document component handoff", detail: "Design systems", progress: 45, status: "In progress", due: "Due Sep 24" },
  ], activities: [
    { type: "upload", text: "Uploaded 3 research synthesis files", meta: "Onboarding research", time: "Today, 10:32 AM" },
    { type: "mail", text: "Sent an update to the Growth team", meta: "Subject: Usability insights — week 3", time: "Today, 9:14 AM" },
    { type: "comment", text: "Left feedback on the onboarding prototype", meta: "Figma · 4 comments", time: "Yesterday, 4:48 PM" },
    { type: "task", text: "Moved “Usability test synthesis” to complete", meta: "Task activity", time: "Yesterday, 3:05 PM" },
  ] },
  { id: 2, name: "Daniel Ross", initials: "DR", role: "Frontend Engineer", department: "Engineering", start: "19 Aug 2026", remaining: 31, score: 76, status: "Well done", color: "#ffe6c7", tasks: [
    { title: "Build billing settings screen", detail: "Frontend · Billing", progress: 70, status: "In progress", due: "Due Sep 22" },
    { title: "Resolve mobile navigation bugs", detail: "Frontend · Core product", progress: 100, status: "Complete", due: "Completed Sep 7" },
    { title: "Write component test coverage", detail: "Engineering quality", progress: 35, status: "In progress", due: "Due Sep 28" },
  ], activities: [
    { type: "task", text: "Opened a pull request for billing settings", meta: "PR #286 · 12 files changed", time: "Today, 11:08 AM" },
    { type: "mail", text: "Replied to implementation feedback", meta: "Subject: Billing settings review", time: "Yesterday, 5:20 PM" },
    { type: "comment", text: "Commented on a customer-reported issue", meta: "Issue #1194", time: "Yesterday, 2:15 PM" },
  ] },
  { id: 3, name: "Priya Shah", initials: "PS", role: "People Operations", department: "People", start: "26 Aug 2026", remaining: 38, score: 71, status: "Well done", color: "#e9dcff", tasks: [{ title: "Refresh new starter checklist", detail: "People operations", progress: 90, status: "In progress", due: "Due Sep 17" }, { title: "Audit leave policy pages", detail: "Knowledge base", progress: 100, status: "Complete", due: "Completed Sep 6" }], activities: [{ type: "upload", text: "Uploaded a revised onboarding checklist", meta: "People hub · Version 3", time: "Today, 8:42 AM" }, { type: "mail", text: "Sent welcome information to new starters", meta: "6 recipients", time: "Yesterday, 10:16 AM" }] },
  { id: 4, name: "Marcus Lee", initials: "ML", role: "Account Executive", department: "Sales", start: "02 Sep 2026", remaining: 45, score: 58, status: "Needs support", color: "#d5f0df", tasks: [{ title: "Complete CRM discovery notes", detail: "Sales · Pipeline", progress: 45, status: "In progress", due: "Due Sep 16" }, { title: "Deliver product knowledge assessment", detail: "Training", progress: 20, status: "In progress", due: "Due Sep 19" }], activities: [{ type: "mail", text: "Opened sales enablement resources", meta: "Training series · 3 documents", time: "Yesterday, 1:24 PM" }, { type: "comment", text: "Asked a question in the onboarding channel", meta: "#sales-onboarding", time: "Monday, 3:02 PM" }] },
  { id: 5, name: "Sofia Nguyen", initials: "SN", role: "Marketing Associate", department: "Marketing", start: "09 Sep 2026", remaining: 52, score: 83, status: "Above & beyond", color: "#ffe1eb", tasks: [{ title: "Prepare Q4 campaign brief", detail: "Marketing · Campaigns", progress: 68, status: "In progress", due: "Due Sep 26" }, { title: "Compile social performance report", detail: "Marketing · Reporting", progress: 100, status: "Complete", due: "Completed Sep 9" }], activities: [{ type: "upload", text: "Uploaded the August social report", meta: "Growth drive", time: "Today, 9:02 AM" }, { type: "task", text: "Completed social performance report", meta: "2 days ahead of schedule", time: "Yesterday, 4:34 PM" }] },
];

const iconPaths: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>, check: <path d="m5 12 4 4L19 6"/>, chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 3 2 5-7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.68 18.66a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.02 15a1.7 1.7 0 0 0-1.56-1.03H5.4v-3h.06A1.7 1.7 0 0 0 7.02 9.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.71 4.7v-.08h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z"/></>,
  search: <><circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>, plus: <path d="M12 5v14M5 12h14"/>, filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>, dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>, mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>, upload: <><path d="M12 17V3M7 8l5-5 5 5"/><path d="M5 21h14"/></>, message: <path d="M21 11.5a8.3 8.3 0 0 1-9 8.2 8.3 8.3 0 0 1-4.1-1.1L3 20l1.5-4.3A8.3 8.3 0 1 1 21 11.5Z"/>, clipboard: <><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M9 12h6M9 16h4"/></>, sparkles: <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3ZM19 15l-.6 2.1-2.1.6 2.1.6.6 2.1.6-2.1 2.1-.6-2.1-.6L19 15Z"/>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>, zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
};
function Icon({ name, size = 18, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) { return <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>; }

const getEstimation = (status: string, role: string) => {
  const estimations: Record<string, any> = {
    "Above & beyond": {
      Manager: "Consistently moving technical work forward, closing tasks quickly, and exceeding velocity expectations.",
      HR: "Demonstrating exceptional cultural fit, highly proactive in team communication, and mentoring peers.",
      tone: "excellent"
    },
    "Well done": {
      Manager: "Meeting role expectations with steady code delivery and a healthy ramp-up trajectory on core systems.",
      HR: "Settling into the team well, communicating effectively, and completing all mandatory onboarding milestones.",
      tone: "good"
    },
    "Needs support": {
      Manager: "Velocity is lower than expected. Recommend reviewing recent blockers in Jira and doing a pair-programming session.",
      HR: "Would benefit from a focused check-in regarding their well-being and a clear plan to build confidence in their new environment.",
      tone: "support"
    },
  };
  const est = estimations[status] || estimations["Needs support"];
  return { copy: est[role], tone: est.tone };
};

export default function Home() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewRole, setViewRole] = useState<"Manager" | "HR">("Manager");
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // Fetch users from DB on mount
  useEffect(() => {
    const loadUsers = () => fetch("/api/users").then(r => r.json()).then(data => {
      if (data.success && data.users.length > 0) {
        setPeople(data.users.map((u: any) => ({
          id: u.id, name: u.name, initials: u.initials, role: u.role,
          department: u.department, start: u.start_date, remaining: u.remaining,
          score: u.score, status: u.status as any, color: u.color,
          tasks: [], activities: []
        })));
      }
    }).catch(() => {});
    loadUsers();
    const interval = window.setInterval(loadUsers, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const [selectedId, setSelectedId] = useState(1); 
  const [query, setQuery] = useState(""); 
  const [tab, setTab] = useState<"Overview" | "Tasks" | "Activity">("Overview"); 
  const [modal, setModal] = useState(false);
  const [currentView, setCurrentView] = useState<"grid" | "people" | "tasks" | "chart">("people");
  const [activeModal, setActiveModal] = useState<"settings" | "how-it-works" | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignalsMenu, setShowSignalsMenu] = useState(false);
  
  const [toast, setToast] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", content: "Hi, I'm your AI Assessment Assistant. I can analyze employee progress, activities, and identify blockers. What would you like to know?" }]);
  const [messageInput, setMessageInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const aiButtonControls = useAnimation();
  
  const [newStaff, setNewStaff] = useState({ name: "", dept: "", role: "", date: "" });
  const [autoEmail, setAutoEmail] = useState(true);
  const [emailPreview, setEmailPreview] = useState<{ html: string; to: string; subject: string } | null>(null);

  const selected = people.find(p => p.id === selectedId) ?? people[0]; 
  const shown = useMemo(() => {
    let filtered = people.filter(p => `${p.name} ${p.role} ${p.department}`.toLowerCase().includes(query.toLowerCase()));
    if (!sortAsc) filtered = [...filtered].reverse();
    return filtered;
  }, [people, query, sortAsc]);
  
  // Fetch events when selected user changes
  useEffect(() => {
    const userId = selected?.id;
    if (userId) {
      const loadEvents = () => fetch(`/api/users/${userId}/events`).then(r => r.json()).then(data => {
        if (data.success) setDbEvents(data.events);
      }).catch(() => {});
      loadEvents();
      const interval = window.setInterval(loadEvents, 15000);
      return () => window.clearInterval(interval);
    }
  }, [selected?.id]);

  const ai = getEstimation(selected?.status, viewRole);
  const progress = Math.round((90 - (selected?.remaining || 60)) / 90 * 100);
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2800); };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    notify(`Generating ${viewRole} summary...`);
    try {
      const res = await fetch("/api/summary/generate", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.id, role: viewRole })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: "assistant", content: `**${viewRole} Summary for ${selected.name}:**\n\n${data.summary}` }]);
        setShowChat(true);
        notify(`${viewRole} summary generated!`);
      } else {
        notify("Error: " + data.error);
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
    setIsGenerating(true);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userId: selected.id, viewRole })
      });
      if (!res.ok) {
        const err = await res.text();
        notify("Gemini Error: " + err);
        return;
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      
      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: aiText };
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
      notify("Failed to connect to AI Buddy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskDetails = async () => {
    setShowChat(true);
    const queryMsg = "Please explain the details behind the current AI Performance Estimate (Score and Status). What factors contributed to this?";
    const newMessages = [...chatMessages, { role: "user", content: queryMsg }];
    setChatMessages(newMessages);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userId: selected.id, viewRole })
      });
      if (!res.ok) {
        const err = await res.text();
        notify("Gemini Error: " + err);
        return;
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      
      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: aiText };
          return updated;
        });
      }
    } catch (e) {
      notify("Failed to connect to AI Buddy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name) { notify("Name is required"); return; }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStaff.name, role: newStaff.role, department: newStaff.dept, startDate: newStaff.date })
      });
      const data = await res.json();
      if (data.success) {
        const u = data.user;
        const newPerson: Person = {
          id: u.id, name: u.name, initials: u.initials, role: u.role,
          department: u.department, start: u.start_date, remaining: u.remaining,
          score: u.score, status: u.status as any, color: u.color,
          tasks: [], activities: []
        };
        setPeople([newPerson, ...people]);
        setModal(false);
        setNewStaff({ name: "", dept: "", role: "", date: "" });
        setSelectedId(newPerson.id);
        notify(`${newStaff.name} has been added to the database.`);
      }
    } catch (e) {
      notify("Failed to add staff.");
    }
  };

  const handleSimulateWebhook = async () => {
    const events = [
      { eventType: "github_commit", description: "Merged PR #312 — feature/dashboard-redesign", payload: { pr: "#312", files: 8, additions: 245 } },
      { eventType: "jira_task", description: "Moved 'Setup CI/CD pipeline' to Done", payload: { task: "Setup CI/CD pipeline", status: "Done" } },
      { eventType: "ms365_document", description: "Created weekly progress report", payload: { source: "OneDrive", type: "docx" } },
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    try {
      const res = await fetch("/api/webhooks/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.id, ...randomEvent })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh user list from DB
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        if (usersData.success) {
          setPeople(usersData.users.map((u: any) => ({
            id: u.id, name: u.name, initials: u.initials, role: u.role,
            department: u.department, start: u.start_date, remaining: u.remaining,
            score: u.score, status: u.status as any, color: u.color,
            tasks: [], activities: []
          })));
        }
        // Refresh events
        const evRes = await fetch(`/api/users/${selected.id}/events`);
        const evData = await evRes.json();
        if (evData.success) setDbEvents(evData.events);
        notify(`⚡ Webhook: ${randomEvent.description} (+${data.scoreBoost} points)`);
        // Event-Driven: Auto Email Report
        if (autoEmail) {
          try {
            const emailRes = await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: "huynhminhkhanh.2004@gmail.com",
                employeeName: selected.name,
                eventType: randomEvent.eventType,
                eventDescription: randomEvent.description,
                score: selected.score,
                status: selected.status,
                viewRole
              })
            });
            const emailData = await emailRes.json();
            if (emailData.success) {
              setEmailPreview({ html: emailData.html, to: emailData.to, subject: emailData.subject });
              notify(`📧 Auto-report sent to huynhminhkhanh.2004@gmail.com`);
            }
          } catch {}
        }
      }
    } catch (e) {
      notify("Webhook simulation failed.");
    }
  };

  return <main className="app-shell">
    <aside className="side-rail"><Link href="/" style={{ display: "flex", alignItems: "baseline", textDecoration: "none", color: "inherit" }}><span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -1 }}>Boardy</span><span className="metallic-text" style={{ fontWeight: 900, fontSize: 26, lineHeight: 0.5 }}>.</span></Link><nav className="rail-nav" aria-label="Primary navigation"><button className={`rail-item ${currentView === 'grid' ? 'active' : ''}`} onClick={() => setCurrentView('grid')}><Icon name="grid" /></button><button className={`rail-item ${currentView === 'people' ? 'active' : ''}`} onClick={() => setCurrentView('people')}><Icon name="people" /></button><button className={`rail-item ${currentView === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentView('tasks')}><Icon name="check" /></button><button className={`rail-item ${currentView === 'chart' ? 'active' : ''}`} onClick={() => setCurrentView('chart')}><Icon name="chart" /></button></nav><button className="rail-item rail-bottom" onClick={() => setIsDarkMode(!isDarkMode)}><Icon name={isDarkMode ? "sun" : "moon"} /></button><button className="rail-item" style={{marginBottom:'10px'}} onClick={() => setActiveModal("settings")}><Icon name="settings" /></button></aside>
    {currentView === 'people' && (
      <>
      <section className="staff-panel">
      <div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h1 style={{display:'flex', alignItems:'center', gap:'8px'}}><Icon name="sparkles" size={24} style={{color:'var(--brand-color)'}}/> Probation</h1></div><button className="avatar user-avatar" style={{padding:0, overflow:'hidden'}} onClick={() => setActiveModal("settings")}><img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin" style={{width:'100%', height:'100%', borderRadius:'50%'}}/></button></div>
      <div className="staff-toolbar"><label className="search-field"><Icon name="search" size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" /></label><button className="icon-button" onClick={() => {setSortAsc(!sortAsc); notify(sortAsc ? "Sorted Z-A" : "Sorted A-Z")}}><Icon name="filter" size={17}/></button></div>
      <div className="staff-subheader"><span>ON PROBATION</span><span>{people.length} people</span></div>
      <div className="staff-list">
        <AnimatePresence>
          {shown.map(p => (
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} layout key={p.id} className={`staff-row ${selected.id === p.id ? "selected" : ""}`} onClick={() => {setSelectedId(p.id); setTab("Overview");}}>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} className="avatar" style={{backgroundColor:p.color}} alt={p.name} />
              <span className="staff-copy"><strong>{p.name}</strong><small>{p.role}</small></span>
              {p.status === "Needs support" && <span className="attention-dot"/>}
            </motion.button>
          ))}
        </AnimatePresence>
        {!shown.length && <div className="empty-result">No matching team members.</div>}
      </div>
      <button className="add-person apple-btn" style={{borderRadius: 12}} onClick={() => setModal(true)}><Icon name="plus" size={17}/> Add new staff</button>
    </section>
    
    <section className="workspace">
      <header className="topbar apple-glass">
        <div className="crumb"><span>People</span><span>/</span><strong>Probation review</strong></div>
        <div className="top-actions">
          <div style={{display:'flex', width:'140px', borderRadius:'14px', overflow:'hidden', border:'1px solid var(--brand-color)', fontSize:'11px', fontWeight:'600'}}>
            <button onClick={() => setViewRole("Manager")} style={{flex:1, padding:'6px 0', border:'0', background: viewRole === 'Manager' ? 'var(--brand-color)' : 'transparent', color: viewRole === 'Manager' ? '#fff' : 'var(--brand-color)', cursor:'pointer', transition:'all 0.2s ease'}}>Manager</button>
            <button onClick={() => setViewRole("HR")} style={{flex:1, padding:'6px 0', border:'0', borderLeft:'1px solid var(--brand-color)', background: viewRole === 'HR' ? 'var(--brand-color)' : 'transparent', color: viewRole === 'HR' ? '#fff' : 'var(--brand-color)', cursor:'pointer', transition:'all 0.2s ease'}}>HR</button>
          </div>
          <button className="apple-btn" onClick={handleSimulateWebhook} style={{border:'1px dashed var(--brand-color)',background:'transparent',color:'var(--brand-color)',padding:'8px 12px',fontSize:'12px',cursor:'pointer',display:'flex',gap:'6px',alignItems:'center'}}>
            <Icon name="zap" size={14}/> Simulate Webhook
          </button>
          <button onClick={() => { setAutoEmail(!autoEmail); notify(autoEmail ? "Auto-email OFF" : "Auto-email ON"); }} style={{
            border: '1px solid ' + (autoEmail ? '#10b981' : 'var(--panel-border)'),
            background: autoEmail ? '#ecfdf5' : 'transparent',
            color: autoEmail ? '#10b981' : 'var(--muted)',
            padding: '8px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', gap: '5px', alignItems: 'center', borderRadius: '14px', transition: 'all 0.2s'
          }}>
            <Icon name="mail" size={13}/> {autoEmail ? '📧 Auto' : 'Email Off'}
          </button>
          <button className="apple-btn metallic-bg" onClick={handleGenerateSummary} disabled={isGenerating} style={{border:'0',color:'#fff',padding:'8px 0',fontSize:'12px',cursor:'pointer',width:'135px',textAlign:'center'}}>
            {isGenerating ? "Generating..." : `${viewRole} Summary`}
          </button>
          <div style={{position:'relative'}}>
            <button className="icon-button notification" onClick={() => setShowNotif(!showNotif)}><Icon name="bell" size={18}/><i/></button>
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:5}} className="dropdown-menu" style={{position:'absolute', top:'100%', right:0, marginTop:'8px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', width:'280px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)', zIndex:100}}>
                  <div style={{padding:'12px 16px', borderBottom:'1px solid #e2e8f0', fontWeight:'bold', fontSize:'13px'}}>Recent Activity</div>
                  <div style={{maxHeight:'240px', overflowY:'auto', padding:'8px'}}>
                    {dbEvents.slice(0, 3).map((ev: any, i) => (
                      <div key={i} style={{padding:'8px', fontSize:'12px', color:'#475569', borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9'}}>
                        <strong style={{color:'#0f172a', display:'block'}}>{ev.description}</strong>
                        {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    ))}
                    {dbEvents.length === 0 && <div style={{padding:'12px', fontSize:'12px', color:'#64748b'}}>No recent activity.</div>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="avatar profile-avatar" style={{padding:0, overflow:'hidden'}} onClick={() => setActiveModal("settings")}><img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin" style={{width:'100%', height:'100%', borderRadius:'50%'}}/></button>
        </div>
      </header>
      
      <div className="content-wrap">
        <motion.div key={selected.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <section className="profile-header">
            <div className="profile-title">
              <span className="large-avatar" style={{backgroundColor:selected.color}}>
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selected.name.replace(/\s+/g, '')}&backgroundColor=${selected.color.replace('#','')}`} alt={selected.name} style={{width:'100%', height:'100%', borderRadius:'50%'}}/>
              </span>
              <div>
                <div className="title-row">
                  <h2><span className="metallic-text">{selected.name}</span></h2>
                  <span className={`status-pill ${ai.tone}`}>{selected.status}</span>
                </div>
                <p>{selected.role} <span>·</span> {selected.department} <span style={{marginLeft:8, color:'#6259cc', fontWeight:700}}>Zapier ID: {selected.id}</span></p>
              </div>
            </div>
            <div style={{position:'relative'}}>
              <button className="more-button" onClick={() => setShowProfileMenu(!showProfileMenu)}><Icon name="dots" size={20}/></button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="dropdown-menu" style={{position:'absolute', top:'100%', right:0, marginTop:'4px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', minWidth:'180px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:100, padding:'4px', display:'flex', flexDirection:'column'}}>
                    <button style={{padding:'8px 12px', textAlign:'left', fontSize:'13px', background:'transparent', border:'0', cursor:'pointer', borderRadius:'4px'}} onClick={() => {notify("Edit profile action"); setShowProfileMenu(false);}}>Edit Profile</button>
                    <button style={{padding:'8px 12px', textAlign:'left', fontSize:'13px', background:'transparent', border:'0', cursor:'pointer', borderRadius:'4px'}} onClick={() => {notify("Assign new task"); setShowProfileMenu(false);}}>Assign Task</button>
                    <div style={{height:'1px', background:'#e2e8f0', margin:'4px 0'}}/>
                    <button style={{padding:'8px 12px', textAlign:'left', fontSize:'13px', background:'transparent', border:'0', cursor:'pointer', borderRadius:'4px', color:'#ef4444'}} onClick={() => {notify("Suspended user"); setShowProfileMenu(false);}}>Suspend User</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
          <section className="probation-banner"><div className="calendar-icon"><Icon name="calendar" size={18}/></div><div className="probation-copy"><span>PROBATION PERIOD</span><strong>{selected.remaining} days remaining</strong><small>Started {selected.start} · Review due 10 Oct 2026</small></div><div className="progress-summary"><div><span>Progress</span><strong>{progress}%</strong></div><div className="progress-track"><motion.i initial={{width:0}} animate={{width:`${progress}%`}} transition={{duration:0.8}}/></div></div></section>
        </motion.div>

        <div className="tabs" role="tablist">
          {(["Overview","Tasks","Activity"] as const).map(name => (
            <button key={name} className={tab===name?"active":""} onClick={() => setTab(name as any)}>
              {name}{name === "Tasks" && <span>{selected.tasks.length}</span>}{name === "Activity" && <span>{dbEvents.length}</span>}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            {tab === "Overview" && <><section className="section-topline"><div><span className="eyebrow">{viewRole === "Manager" ? "ONBOARDING HEALTH" : "CULTURE & FIT"}</span><h3>{viewRole === "Manager" ? "Milestone progress" : "Onboarding sentiment"}</h3></div><button className="text-button" onClick={() => setActiveModal("how-it-works")}>How it works <Icon name="arrow" size={15}/></button></section><section className="estimate-grid"><article className={`score-card ${ai.tone}`}><div className="score-card-head"><span>{viewRole === "Manager" ? "Overall health" : "Culture fit"}</span><Icon name="sparkles" size={18}/></div><div className="score-content"><div className="score-ring" style={{"--score":`${progress * 3.6}deg`} as React.CSSProperties}><div><strong><span className="metallic-text">{progress}</span></strong><span>%</span></div></div><div><h4>{selected.status}</h4><p>{ai.copy}</p></div></div><div className="score-foot"><span>Based on tasks, activity & feedback</span><button onClick={handleAskDetails}>View details <Icon name="arrow" size={14}/></button></div></article><article className="signals-card"><div className="card-title"><div><span className="eyebrow">KEY SIGNALS</span><h3>What’s driving this</h3></div><div style={{position:'relative'}}><button className="more-button" onClick={() => setShowSignalsMenu(!showSignalsMenu)}><Icon name="dots" size={18}/></button>
              <AnimatePresence>
                {showSignalsMenu && (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="dropdown-menu" style={{position:'absolute', top:'100%', right:0, marginTop:'4px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', minWidth:'180px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:100, padding:'4px', display:'flex', flexDirection:'column'}}>
                    <button style={{padding:'8px 12px', textAlign:'left', fontSize:'13px', background:'transparent', border:'0', cursor:'pointer', borderRadius:'4px'}} onClick={() => {notify("Recalculating signals based on latest data..."); setShowSignalsMenu(false);}}>Recalculate Signals</button>
                    <button style={{padding:'8px 12px', textAlign:'left', fontSize:'13px', background:'transparent', border:'0', cursor:'pointer', borderRadius:'4px'}} onClick={() => {notify("Exported signals to CSV"); setShowSignalsMenu(false);}}>Export to CSV</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div></div>
            {viewRole === "Manager" ? (
              <div className="signals"><Signal icon="check" color="purple" title={`${selected.tasks.filter(t => t.progress === 100).length + 4} technical tasks closed`} body="High velocity on assigned sprint" impact="+12"/><Signal icon="upload" color="blue" title="Consistent code quality" body="Low PR rejection rate" impact="+8"/><Signal icon="clipboard" color="orange" title="Growth opportunity" body="System architecture understanding" impact="—"/></div>
            ) : (
              <div className="signals"><Signal icon="check" color="purple" title="Onboarding milestones met" body="Completed all induction sessions" impact="+12"/><Signal icon="message" color="blue" title="Responsive collaboration" body="Highly active in team channels" impact="+8"/><Signal icon="clipboard" color="orange" title="Growth opportunity" body="Cross-departmental networking" impact="—"/></div>
            )}
            </article></section><section className="section-topline task-heading"><div><span className="eyebrow">{viewRole === "Manager" ? "CURRENT WORK" : "CORE ROADMAP"}</span><h3>{viewRole === "Manager" ? "Assigned tasks" : "Onboarding Milestones"}</h3></div><button className="text-button" onClick={() => setTab("Tasks")}>View all tasks <Icon name="arrow" size={15}/></button></section><section className="tasks-card">{selected.tasks.map(t => <TaskRow task={t} key={t.title}/>)}</section><section className="section-topline activity-heading"><div><span className="eyebrow">{viewRole === "Manager" ? "RECENT ACTIVITY" : "TEAM ENGAGEMENT"}</span><h3>{viewRole === "Manager" ? "Latest updates" : "Social & Feedback"}</h3></div><button className="text-button" onClick={() => setTab("Activity")}>View activity <Icon name="arrow" size={15}/></button></section><section className="activity-card">{selected.activities.slice(0,3).map((a,i) => <ActivityRow activity={a} key={i}/>)}</section></>}
            
            {tab === "Tasks" && <section className="tasks-card full-card">{selected.tasks.length === 0 ? <div style={{padding:'20px',color:'#777'}}>No tasks yet.</div> : selected.tasks.map(t => <TaskRow task={t} key={t.title}/>)}</section>}
            
            {tab === "Activity" && <section className="activity-card full-card">{dbEvents.length === 0 ? <div style={{padding:'20px',color:'#777'}}>No events recorded yet.</div> : dbEvents.map((ev: any) => <DbActivityRow event={ev} key={ev.id}/>)}</section>}
            
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
    </>
    )}

    {currentView === 'grid' && <GridView people={people} setSelectedId={setSelectedId} setCurrentView={setCurrentView} />}
    {currentView === 'tasks' && <TasksView people={people} />}
    {currentView === 'chart' && <ChartView people={people} dbEvents={dbEvents} />}
    
    <AnimatePresence>
      {activeModal && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-backdrop" onMouseDown={() => setActiveModal(null)} style={{zIndex:200}}>
          <motion.div initial={{scale:0.95, y:10}} animate={{scale:1, y:0}} exit={{scale:0.95, y:10}} className="modal" onMouseDown={e=>e.stopPropagation()} style={{maxWidth: activeModal === 'settings' ? '400px' : '500px'}}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            {activeModal === 'settings' ? (
              <>
                <span className="eyebrow">WORKSPACE PREFERENCES</span>
                <h2>Settings</h2>
                <p>Configure your workspace settings here.</p>
                <div style={{marginTop:'20px', display:'flex', flexDirection:'column'}}>
                  <label className="setting-row">
                    <span>Dark Mode<small>Switch between light and metallic dark themes</small></span>
                    <div className="toggle-switch"><input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} /><span className="toggle-slider"></span></div>
                  </label>
                  <label className="setting-row">
                    <span>Email Notifications<small>Receive alerts for important onboarding updates</small></span>
                    <div className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></div>
                  </label>
                  <label className="setting-row">
                    <span>Weekly Summary Report<small>Get a Friday digest of team performance</small></span>
                    <div className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></div>
                  </label>
                </div>
                <div className="modal-actions" style={{marginTop:'24px'}}>
                  <button className="primary-button" style={{width:'100%'}} onClick={() => {notify("Settings saved"); setActiveModal(null);}}>Save Changes</button>
                </div>
              </>
            ) : (
              <>
                <span className="eyebrow">AI ESTIMATE LOGIC</span>
                <h2>How AI Scoring Works</h2>
                <p>Boardy uses an event-driven architecture to evaluate performance silently without intrusive surveillance.</p>
                {viewRole === "Manager" ? (
                  <div style={{background:'#f8fafc', padding:'16px', borderRadius:'8px', marginTop:'16px', fontSize:'13px', lineHeight:'1.6', color:'#334155'}}>
                    <ul style={{paddingLeft:'16px', display:'flex', flexDirection:'column', gap:'8px'}}>
                      <li><strong>GitHub Commits & PRs:</strong> High impact on technical scores. (+5 points per event)</li>
                      <li><strong>Jira Tasks:</strong> Tracks velocity and blocker resolution. (+8 points for completion)</li>
                      <li><strong>Code Reviews:</strong> Measures collaboration and code quality. (+3 points)</li>
                      <li><strong>Incident Resolution:</strong> Responsiveness to critical issues. (+2 to +4 points)</li>
                    </ul>
                  </div>
                ) : (
                  <div style={{background:'#f8fafc', padding:'16px', borderRadius:'8px', marginTop:'16px', fontSize:'13px', lineHeight:'1.6', color:'#334155'}}>
                    <ul style={{paddingLeft:'16px', display:'flex', flexDirection:'column', gap:'8px'}}>
                      <li><strong>Milestone Completion:</strong> Tracks completion of mandatory 30/60/90 day goals. (+5 points)</li>
                      <li><strong>Peer Feedback:</strong> Aggregates sentiment from Slack/Teams interactions. (+8 points)</li>
                      <li><strong>1-on-1 Check-ins:</strong> Consistency and quality of manager check-ins. (+3 points)</li>
                      <li><strong>Culture & Collaboration:</strong> Participation in team events and discussions. (+2 to +4 points)</li>
                    </ul>
                  </div>
                )}
                <div className="modal-actions" style={{marginTop:'24px'}}>
                  <button className="primary-button" style={{width:'100%'}} onClick={() => setActiveModal(null)}>Got it</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {modal && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-backdrop" onMouseDown={() => setModal(false)}>
          <motion.div initial={{scale:0.95, y:10}} animate={{scale:1, y:0}} exit={{scale:0.95, y:10}} className="modal" onMouseDown={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(false)}>×</button>
            <span className="eyebrow">NEW PROBATION RECORD</span>
            <h2>Add a team member</h2>
            <p>Create a profile to start tracking onboarding progress and probation milestones.</p>
            <div className="form-grid">
              <label>Full name<input placeholder="e.g. Jordan Taylor" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name:e.target.value})}/></label>
              <label>Department<select value={newStaff.dept} onChange={e=>setNewStaff({...newStaff, dept:e.target.value})}><option value="" disabled>Select department</option><option>Product</option><option>Engineering</option><option>People</option><option>Sales</option></select></label>
              <label>Job title<input placeholder="e.g. Customer Success Manager" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role:e.target.value})}/></label>
              <label>Start date<input type="date" value={newStaff.date} onChange={e=>setNewStaff({...newStaff, date:e.target.value})}/></label>
            </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button apple-btn" onClick={() => setModal(false)}>Cancel</button>
                <button type="button" className="primary-button apple-btn metallic-bg" onClick={handleAddStaff}>Add to Probation</button>
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <AnimatePresence>
      {toast && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="toast">
          <Icon name="check" size={16}/>{toast}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Floating Chat Widget */}
    <motion.div 
      drag 
      dragMomentum={false}
      animate={aiButtonControls}
      onDragEnd={(e, info) => {
        const isLeft = info.point.x < window.innerWidth / 2;
        aiButtonControls.start({
          x: isLeft ? -window.innerWidth + 116 : 0,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        });
      }}
      className="floating-chat-btn" 
      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
      onClick={() => setShowChat(!showChat)}
    >
      <Icon name={showChat ? "plus" : "sparkles"} size={22} style={{ color: '#fff', transform: showChat ? 'rotate(45deg)' : 'none', transition: '0.3s' }}/>
    </motion.div>

    <AnimatePresence>
      {showChat && (
        <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} transition={{duration:0.2}} className="floating-chat-window">
          <div className="chat-header">
            <h3><Icon name="sparkles" size={18} style={{color:'var(--brand-color)'}}/> AI Buddy</h3>
            <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--muted)'}} onClick={() => setShowChat(false)}><Icon name="dots" size={18}/></button>
          </div>
          
          <div className="chat-body" style={{background:'transparent'}}>
            {chatMessages.map((msg, i) => (
              <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown components={{
                    p: ({node, ...props}) => <p style={{margin: '0 0 8px 0'}} {...props} />,
                    ul: ({node, ...props}) => <ul style={{margin: '0 0 8px 0', paddingLeft: '20px'}} {...props} />,
                    li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
                    strong: ({node, ...props}) => <strong style={{fontWeight: 700}} {...props} />,
                  }}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </motion.div>
            ))}
            {isGenerating && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="chat-msg ai" style={{display:'flex', flexDirection:'row', gap:'4px', alignItems:'center', padding:'16px'}}>
                <motion.span animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0}} style={{width:6,height:6,background:'#aaa',borderRadius:'50%',display:'block'}}/>
                <motion.span animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.2}} style={{width:6,height:6,background:'#aaa',borderRadius:'50%',display:'block'}}/>
                <motion.span animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.4}} style={{width:6,height:6,background:'#aaa',borderRadius:'50%',display:'block'}}/>
              </motion.div>
            )}
          </div>

          <div className="chat-input-area">
            <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} disabled={isGenerating} placeholder="Ask about this employee..." />
            <button onClick={handleSendMessage} disabled={isGenerating} className="metallic-bg"><Icon name="arrow" size={16} style={{transform:'rotate(90deg)'}}/></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Email Preview Modal */}
    <AnimatePresence>
      {emailPreview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}
          onClick={() => setEmailPreview(null)}>
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
            style={{ width: 'min(640px, 90vw)', maxHeight: '85vh', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📧 Auto Email Report
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>SENT</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  To: <strong>{emailPreview.to}</strong> · {emailPreview.subject}
                </div>
              </div>
              <button onClick={() => setEmailPreview(null)} style={{ border: 'none', background: 'transparent', fontSize: '20px', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <iframe srcDoc={emailPreview.html} style={{ width: '100%', height: '500px', border: 'none' }} title="Email Preview" />
            </div>
            <div style={{ padding: '12px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', flex: 1, display: 'flex', alignItems: 'center' }}>Event-Driven Architecture · Triggered by Webhook</span>
              <button onClick={() => setEmailPreview(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </main>;
}

function Signal({icon,color,title,body,impact}:{icon:string;color:string;title:string;body:string;impact:string}) { return <div><span className={`signal-icon ${color}`}><Icon name={icon} size={16}/></span><p><strong>{title}</strong><small>{body}</small></p><b className={impact === "—" ? "neutral" : "positive"}>{impact}</b></div>; }
function TaskRow({task}:{task:Task}) { return <div className="task-row"><div className="task-main"><span className={`task-check ${task.progress===100?"done":""}`}>{task.progress===100&&<Icon name="check" size={13}/>}</span><div><strong>{task.title}</strong><small>{task.detail}</small></div></div><div className="task-progress"><div className="mini-bar"><i style={{width:`${task.progress}%`}}/></div><span>{task.progress}%</span></div><div className={`task-status ${task.progress===100?"complete":""}`}>{task.status}</div><small className="due">{task.due}</small><button className="more-button"><Icon name="dots" size={17}/></button></div>; }
function ActivityRow({activity}:{activity:Activity}) { const icons={mail:"mail",upload:"upload",task:"check",comment:"message"}; return <div className="activity-row"><span className={`activity-icon ${activity.type}`}><Icon name={icons[activity.type]} size={16}/></span><div><strong>{activity.text}</strong><small>{activity.meta}</small></div><time>{activity.time}</time></div>; }
function DbActivityRow({event}:{event:any}) { const iconMap: Record<string,string> = {github_commit:"upload",github_issue:"message",jira_task:"check",ms365_document:"upload",ms365_email:"mail",figma_comment:"message",slack_message:"message",file_uploaded:"upload",file_updated:"upload",task_completed:"check"}; const typeMap: Record<string,string> = {github_commit:"upload",github_issue:"comment",jira_task:"task",ms365_document:"upload",ms365_email:"mail",figma_comment:"comment",slack_message:"comment",file_uploaded:"upload",file_updated:"upload",task_completed:"task"}; return <div className="activity-row"><span className={`activity-icon ${typeMap[event.event_type] || 'task'}`}><Icon name={iconMap[event.event_type] || "check"} size={16}/></span><div><strong>{event.description}</strong><small>{`${event.source || "manual"} · ${event.event_type.replace(/_/g, " ")}`.toUpperCase()}</small></div><time>{new Date(event.timestamp).toLocaleString()}</time></div>; }
