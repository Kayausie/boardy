import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChartView({ people, dbEvents }: { people: any[], dbEvents: any[] }) {
  // Generate trend data
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

  const avgScore = Math.round(people.reduce((sum, p) => sum + p.score, 0) / (people.length || 1));
  const topPerformers = Math.round((people.filter(p => p.status === 'Above & beyond').length / (people.length || 1)) * 100);

  return (
    <section style={{flex: 1, padding: '40px', overflowY: 'auto'}}>
      <div className="section-topline">
        <div><span className="eyebrow">REPORTS</span><h1 style={{fontSize:'24px',margin:0,color:'var(--ink)'}}>AI Performance Stats</h1></div>
      </div>
      <div className="chart-view" style={{marginTop:'24px', maxWidth:'1000px'}}>
        <div className="stat-card">
          <div className="stat-label">Avg Team Score</div>
          <div className="stat-value">{avgScore}</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Out of 100</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Above & Beyond</div>
          <div className="stat-value">{topPerformers}%</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Of all employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{dbEvents.length > 0 ? dbEvents.length + 42 : 42}</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Captured silently</div>
        </div>
      </div>
      
      <div style={{marginTop:'30px', maxWidth:'1000px', background:'var(--card-bg)', border:'1px solid var(--panel-border)', borderRadius:'12px', padding:'24px'}}>
        <h3 style={{margin:'0 0 20px', fontSize:'16px', letterSpacing:'-0.25px', color:'var(--ink)'}}>Team Score Trend</h3>
        <div style={{width:'100%', height:300}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted)'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted)'}} />
              <Tooltip contentStyle={{borderRadius:'8px', border:'1px solid var(--panel-border)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', backgroundColor:'var(--card-bg)', color:'var(--ink)'}} />
              <Line type="monotone" dataKey="score" stroke="var(--brand-color)" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
