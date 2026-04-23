import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DotNav from '../components/DotNav';
import ArticleCard from '../components/ArticleCard';
import MoneyWoundQuiz from '../components/MoneyWoundQuiz';

const BUNNY_BASE = 'https://money-wound.b-cdn.net';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'intro', label: 'About' },
  { id: 'wound-types', label: 'The Wounds' },
  { id: 'quiz', label: 'Assessment' },
  { id: 'articles', label: 'Articles' },
];

interface Article {
  slug: string;
  title: string;
  meta_description: string;
  category: string;
  image_url: string;
  image_alt: string;
  reading_time: number;
  published_at: string;
}

declare global { interface Window { __INITIAL_DATA__?: Record<string, any>; } }

export default function HomePage() {
  const initialArticles = (typeof window !== 'undefined' ? window.__INITIAL_DATA__?.articles : (global as any).__INITIAL_DATA__?.articles) || [];
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    if (articles.length === 0) {
      fetch('/api/articles?limit=6')
        .then(r => r.json())
        .then(d => setArticles(d.articles || []))
        .catch(() => {});
    }
  }, []);

  return (
    <>
      <DotNav sections={sections} />

      {/* Hero */}
      <section id="hero" className="hero" aria-label="Hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: `url(${BUNNY_BASE}/images/hero-home.webp)` }}
          role="img"
          aria-label="Abstract image of light through water, representing financial healing"
        />
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="hero__eyebrow">Financial Trauma &bull; Money Healing &bull; Wealth Consciousness</div>
          <h1 className="hero__title">The Money Wound</h1>
          <p className="hero__subtitle">
            Where personal finance meets shadow work. Healing the invisible wounds
            that keep you broke, terrified, or guilt-ridden about money.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#quiz" className="btn-primary" onClick={e => { e.preventDefault(); document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Find Your Money Wound
            </a>
            <Link to="/articles" className="btn-secondary">
              Read the Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="intro" className="home-intro scroll-section">
        <div className="content-container">
          <div className="section-divider" />
          <h2>Your bank account is a mirror, not a scorecard.</h2>
          <p>
            Most financial advice treats money as a math problem. Add income, subtract expenses, invest the rest.
            But if it were that simple, you'd have done it already.
          </p>
          <p>
            The real reason people stay stuck isn't ignorance. It's the story they inherited about what money means,
            what they deserve, and what happens when they actually have enough.
          </p>
          <p>
            Kalesh writes about the emotional and psychological roots of financial behavior - drawing from
            financial therapy, trauma research, and contemplative practice.
          </p>
          <Link to="/about" className="btn-primary" style={{ marginTop: '1rem' }}>
            About Kalesh
          </Link>
        </div>
      </section>

      {/* Wound Types */}
      <section id="wound-types" className="wound-types scroll-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-md)' }}>
          <div className="section-header">
            <div className="section-divider" />
            <h2>The Seven Money Wounds</h2>
            <p style={{ maxWidth: '50ch', margin: '0 auto', color: 'rgba(45,42,38,0.7)' }}>
              Every financial pattern has an emotional root. Which one is running your life?
            </p>
          </div>
          <div className="wound-types__grid">
            {[
              { icon: '🪞', title: 'The Scarcity Wound', desc: 'No matter how much you earn, it never feels like enough.' },
              { icon: '🔥', title: 'The Self-Sabotage Wound', desc: 'You hit a new income level and immediately find a way to lose it.' },
              { icon: '😶', title: 'The Shame Wound', desc: 'Money is a source of deep embarrassment, not just stress.' },
              { icon: '👻', title: 'The Inherited Wound', desc: 'You\'re living your parents\' money story, not your own.' },
              { icon: '🧊', title: 'The Freeze Wound', desc: 'Financial decisions paralyze you. Avoidance is your strategy.' },
              { icon: '💸', title: 'The Underearning Wound', desc: 'You consistently charge less than your work is worth.' },
              { icon: '🔗', title: 'The Control Wound', desc: 'Money is how you manage anxiety - hoarding or spending.' },
            ].map(w => (
              <div key={w.title} className="wound-card">
                <div className="wound-card__icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section id="quiz" className="scroll-section" style={{ background: 'white', padding: 'var(--space-2xl) var(--space-md)' }}>
        <div className="content-container">
          <div className="section-divider" />
          <MoneyWoundQuiz />
        </div>
      </section>

      {/* Articles */}
      <section id="articles" className="featured-articles scroll-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-md)' }}>
          <div className="section-header">
            <div className="section-divider" />
            <h2>Recent Articles</h2>
            <p style={{ maxWidth: '50ch', margin: '0 auto', color: 'rgba(45,42,38,0.7)' }}>
              Long-form writing on money psychology, financial trauma, and healing your relationship with wealth.
            </p>
          </div>
          {articles.length > 0 ? (
            <div className="articles-grid">
              {articles.map(a => (
                <ArticleCard
                  key={a.slug}
                  slug={a.slug}
                  title={a.title}
                  metaDescription={a.meta_description}
                  category={a.category}
                  imageUrl={a.image_url}
                  imageAlt={a.image_alt}
                  readingTime={a.reading_time}
                  publishedAt={a.published_at}
                />
              ))}
            </div>
          ) : (
            <div className="articles-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-copper-soft) 100%)' }} />
                  <div style={{ padding: 'var(--space-md)' }}>
                    <div style={{ height: '1rem', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', marginBottom: '0.5rem', width: '40%' }} />
                    <div style={{ height: '1.5rem', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '1rem', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Link to="/articles" className="btn-primary">View All Articles</Link>
          </div>
        </div>
      </section>

      {/* Kalesh Quote */}
      <section style={{ background: 'linear-gradient(135deg, #1A5F5A 0%, #0D3D3A 100%)', padding: 'var(--space-2xl) var(--space-md)', textAlign: 'center' }}>
        <div className="content-container">
          <blockquote style={{ border: 'none', background: 'transparent', color: 'white', fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', padding: 0, margin: '0 auto', maxWidth: '700px' }}>
            "Wealth isn't what you accumulate. It's what you stop fearing."
          </blockquote>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 'var(--space-md)', fontSize: '0.9rem' }}>- Kalesh</p>
        </div>
      </section>
    </>
  );
}
