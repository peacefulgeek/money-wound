import React from 'react';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';
const TAG = 'spankyspinola-20';

const tools = [
  {
    category: 'Books on Money Psychology',
    items: [
      { asin: '1626566445', name: 'The Soul of Money', author: 'Lynne Twist', desc: 'A radical rethinking of your relationship with money - from scarcity to sufficiency.' },
      { asin: '1608684296', name: 'The Art of Money', author: 'Bari Tessler', desc: 'Financial therapy meets practical money management. One of the most compassionate money books written.' },
      { asin: '0316346624', name: 'The Psychology of Money', author: 'Morgan Housel', desc: 'Why smart people make terrible financial decisions - and what\'s actually going on.' },
      { asin: '0062435612', name: 'Lost and Found', author: 'Geneen Roth', desc: 'The connection between how we eat and how we spend. Uncomfortable and essential.' },
      { asin: '0062407341', name: 'Mind Over Money', author: 'Brad Klontz', desc: 'The definitive guide to money scripts and how they run your financial life.' },
      { asin: '0143115766', name: 'Your Money or Your Life', author: 'Vicki Robin', desc: 'The classic. Your relationship with money is really a relationship with your life energy.' },
    ]
  },
  {
    category: 'Financial Planning Tools',
    items: [
      { asin: '1250309476', name: 'Budget Planner & Bill Organizer', author: null, desc: 'A physical planner for people who need to see their numbers on paper, not a screen.' },
      { asin: '1647397723', name: 'Clever Fox Budget Planner', author: null, desc: 'Structured monthly budgeting with debt payoff tracking. No app required.' },
      { asin: '1250229006', name: 'Debt Free Chart Tracker', author: null, desc: 'Visual debt payoff tracking. Sometimes you need to see the progress with your eyes.' },
    ]
  },
  {
    category: 'Nervous System & Stress',
    items: [
      { asin: 'B07D93JFGS', name: 'YnM Weighted Blanket', author: null, desc: 'For the nights when financial anxiety won\'t let you sleep. Deep pressure therapy works.' },
      { asin: 'B07CQKRPQM', name: 'Magnesium Glycinate', author: null, desc: 'Magnesium deficiency is epidemic. It\'s also one of the primary drivers of anxiety and poor sleep.' },
      { asin: 'B00YQZXHQO', name: 'Ashwagandha Supplement', author: null, desc: 'Adaptogenic herb with solid research behind cortisol reduction. Useful during high-stress financial periods.' },
      { asin: 'B07JQFBXNQ', name: 'Acupressure Mat', author: null, desc: 'Somatic regulation tool. Fifteen minutes on this mat is genuinely calming.' },
    ]
  },
  {
    category: 'Meditation & Journaling',
    items: [
      { asin: 'B07YJGZX3V', name: 'Five Minute Journal', author: null, desc: 'Daily gratitude practice. Simple, consistent, and it actually changes how you see what you have.' },
      { asin: '0593135652', name: 'Radical Acceptance', author: 'Tara Brach', desc: 'Not a money book. But shame is shame, and Tara Brach understands it better than anyone.' },
      { asin: 'B07BWMKFQD', name: 'Zafu Meditation Cushion', author: null, desc: 'If you\'re going to sit with the discomfort of your money story, you might as well be comfortable.' },
    ]
  },
  {
    category: 'Trauma & Healing',
    items: [
      { asin: '0525559477', name: 'The Body Keeps the Score', author: 'Bessel van der Kolk', desc: 'The foundational text on how trauma lives in the body. Financial trauma is trauma.' },
      { asin: '0062965204', name: 'It Didn\'t Start with You', author: 'Mark Wolynn', desc: 'Inherited family trauma and how it shows up in your present-day patterns - including money.' },
      { asin: '1401952844', name: 'Daring Greatly', author: 'Brene Brown', desc: 'Shame resilience research applied to every area of life. Financial shame included.' },
    ]
  }
];

export default function ToolsPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '40vh',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BUNNY_BASE}/images/hero-tools.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,15,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', padding: '0 var(--space-md)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '0.5rem' }}>
            Money Healing Toolkit
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
            Books, tools, and resources Kalesh actually recommends.
          </p>
        </div>
      </section>

      {/* Disclosure */}
      <div style={{ background: 'var(--accent-soft)', padding: '0.75rem var(--space-md)', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(45,42,38,0.6)' }}>
        As an Amazon Associate, I earn from qualifying purchases. Links marked (paid link) are affiliate links.
      </div>

      {/* Tools */}
      <section style={{ padding: 'var(--space-xl) var(--space-md)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {tools.map(section => (
            <div key={section.category} style={{ marginBottom: 'var(--space-2xl)' }}>
              <h2 style={{ color: 'var(--accent)', borderBottom: '2px solid var(--accent-soft)', paddingBottom: '0.5rem' }}>
                {section.category}
              </h2>
              <div className="tools-grid">
                {section.items.map(item => (
                  <div key={item.asin} className="tool-card">
                    <h3>{item.name}</h3>
                    {item.author && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--accent-copper)', fontWeight: 600, marginBottom: '0.5rem' }}>
                        by {item.author}
                      </p>
                    )}
                    <p>{item.desc}</p>
                    <a
                      href={`https://www.amazon.com/dp/${item.asin}?tag=${TAG}`}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}
                    >
                      View on Amazon
                    </a>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(45,42,38,0.4)', marginLeft: '0.5rem' }}>(paid link)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
