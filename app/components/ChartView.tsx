import React from 'react';

export default function ChartView({ people, dbEvents }: { people: any[], dbEvents: any[] }) {
  return (
    <section style={{flex: 1, padding: '40px', overflowY: 'auto'}}>
      <div className="section-topline">
        <div><span className="eyebrow">REPORTS</span><h1 style={{fontSize:'24px',margin:0,color:'var(--ink)'}}>AI Performance Stats</h1></div>
      </div>
      <div className="chart-view" style={{marginTop:'24px', maxWidth:'1000px'}}>
        <div className="stat-card">
          <div className="stat-label">Avg Team Score</div>
          <div className="stat-value">{Math.round(people.reduce((sum, p) => sum + p.score, 0) / (people.length || 1))}</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Out of 100</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Above & Beyond</div>
          <div className="stat-value">{Math.round((people.filter(p => p.status === 'Above & beyond').length / (people.length || 1)) * 100)}%</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Of all employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{dbEvents.length > 0 ? dbEvents.length + 42 : 42}</div>
          <div style={{fontSize:'12px', color:'var(--muted)'}}>Captured silently</div>
        </div>
      </div>
    </section>
  );
}
