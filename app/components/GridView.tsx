import React from 'react';

const estimation = {
  "Above & beyond": { tone: "excellent" },
  "Well done": { tone: "good" },
  "Needs support": { tone: "support" },
};

export default function GridView({ people, setSelectedId, setCurrentView }: { people: any[], setSelectedId: (id: number) => void, setCurrentView: (v: any) => void }) {
  return (
    <section style={{flex: 1, padding: '40px', overflowY: 'auto'}}>
      <div className="section-topline">
        <div><span className="eyebrow">OVERVIEW</span><h1 style={{fontSize:'24px',margin:0,color:'var(--ink)'}}>Team Grid</h1></div>
      </div>
      <div className="grid-view" style={{marginTop:'24px'}}>
        {people.map(p => (
          <div key={p.id} className="grid-card" onClick={() => {setSelectedId(p.id); setCurrentView('people');}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
              <span className="avatar" style={{backgroundColor:p.color}}>{p.initials}</span>
              <span className={`status-pill ${estimation[p.status as keyof typeof estimation]?.tone || 'support'}`}>{p.status}</span>
            </div>
            <h3 style={{margin:'0 0 4px'}}>{p.name}</h3>
            <p style={{margin:0, fontSize:'12px', color:'var(--muted)'}}>{p.role}</p>
            <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between', fontSize:'11px', color:'var(--muted)', borderTop:'1px solid var(--panel-border)', paddingTop:'12px'}}>
              <span>{p.remaining} days remaining</span>
              <strong>{Math.round((90 - (p.remaining || 60)) / 90 * 100)}% complete</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
