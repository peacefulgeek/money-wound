import React from 'react';
import { Link } from 'react-router-dom';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '50vh',
        minHeight: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BUNNY_BASE}/images/hero-about.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,15,0.6)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', padding: '0 var(--space-md)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'white' }}>About Kalesh</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Consciousness Teacher &amp; Writer</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
        <div className="content-container">
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
            <img
              src={`${BUNNY_BASE}/images/kalesh-photo.webp`}
              alt="Kalesh - Consciousness Teacher and Writer"
              style={{ width: '100%', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%231A5F5A'/%3E%3Ctext x='100' y='135' text-anchor='middle' fill='white' font-size='60' font-family='serif'%3EK%3C/text%3E%3C/svg%3E`;
              }}
            />
            <div>
              <h2 style={{ marginTop: 0 }}>The Money Wound runs deeper than your budget spreadsheet.</h2>
              <p>
                I've spent years studying the intersection of consciousness and money - not as a financial advisor,
                but as someone who watched intelligent, capable people repeatedly sabotage their financial lives
                and couldn't figure out why.
              </p>
              <p>
                The answer, I've come to believe, is almost never about money itself. It's about what money
                represents: safety, love, worthiness, freedom, power. The stories we inherited. The moments
                that taught us what we deserve.
              </p>
              <p>
                My work draws from financial therapy researchers like Brad Klontz and Bari Tessler, from
                Krishnamurti's radical inquiry into conditioning, from Tara Brach's work on shame and
                self-compassion, and from the growing body of somatic trauma research.
              </p>
              <p>
                I'm not here to tell you to make a budget. You know you should make a budget. I'm here to
                help you understand why you don't - and what that resistance is actually protecting.
              </p>
              <p>
                <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex' }}>
                  Visit kalesh.love
                </a>
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-2xl)', padding: 'var(--space-lg)', background: 'var(--accent-soft)', borderRadius: 'var(--border-radius-lg)' }}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>What I believe about money</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
              {[
                'Money is just energy with a story attached to it.',
                'Your bank account is a mirror, not a scorecard.',
                'The poverty consciousness doesn\'t care how much you earn.',
                'Wealth isn\'t what you accumulate. It\'s what you stop fearing.',
                'What if your relationship with money is the most honest relationship you have?',
              ].map(belief => (
                <li key={belief} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-copper)', fontWeight: 700, flexShrink: 0 }}>&mdash;</span>
                  <em style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>{belief}</em>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <Link to="/articles" className="btn-primary">Read the Articles</Link>
          </div>
        </div>
      </section>
    </>
  );
}
